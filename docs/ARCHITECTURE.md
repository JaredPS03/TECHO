# Arquitectura — Subasta de Arte con Causa

> [← Volver al README](../README.md) · [Back to README (EN)](../README.en.md)

Cómo está construida la plataforma y, sobre todo, **por qué** cada decisión se tomó así.

---

## 1. Visión general

Un **monolito Next.js 16** (App Router) desplegado en Vercel, con la base de datos MySQL en el hosting que la
organización ya tenía contratado.

```
Navegador
   │  fetch
   ▼
Next.js Route Handlers  ──── SQL parametrizado ────►  MySQL remoto
   │                                                  artworks
   └── lib/auth.ts  (cookie firmada HMAC)              bids
                                                       admin_users
```

No hay ORM, ni capa de servicios, ni backend separado. Con tres tablas y catorce obras, cada capa añadida habría
sido ceremonia que alguien tendría que mantener después — y detrás de este proyecto no hay un equipo técnico.

## 2. Capas

### 2.1 Sitio público

| Archivo | Responsabilidad |
| :--- | :--- |
| [`app/page.tsx`](../app/page.tsx) | Composición: cabecera, hero, galería y pie |
| [`components/auction/artwork-gallery.tsx`](../components/auction/artwork-gallery.tsx) | Carga el catálogo con SWR, filtra por búsqueda y orquesta el flujo de puja |
| [`components/auction/bid-modal.tsx`](../components/auction/bid-modal.tsx) | Formulario de puja con validación y estado de éxito |
| [`components/auction/artwork-card.tsx`](../components/auction/artwork-card.tsx) | Tarjeta de obra con la puja actual |
| [`components/auction/image-modal.tsx`](../components/auction/image-modal.tsx) | Vista ampliada de la obra |

Los datos de contacto del pujador se guardan en `localStorage` y precargan el formulario la próxima vez. Es un
detalle pequeño con efecto real: quien puja por varias obras en la misma sesión no reescribe sus datos cada vez.

### 2.2 Panel de administración

| Archivo | Responsabilidad |
| :--- | :--- |
| [`app/admin/page.tsx`](../app/admin/page.tsx) | Login; redirige al panel si ya hay sesión |
| [`app/admin/dashboard/page.tsx`](../app/admin/dashboard/page.tsx) | Pestañas de obras y pujas, con SWR |
| [`components/admin/artwork-modal.tsx`](../components/admin/artwork-modal.tsx) | Alta y edición de obras, incluida la imagen |
| [`components/admin/bid-list.tsx`](../components/admin/bid-list.tsx) | Listado de pujas, filtrable por obra |

El panel es cliente puro: la sesión se comprueba pidiendo `/api/admin/session` y, si falla, se redirige al login.
La protección real no está en esa redirección sino en el servidor — cada endpoint de administración llama a
`isAdmin()` antes de tocar nada.

### 2.3 Servidor

Todos los *route handlers* siguen la misma forma:

```ts
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) return unauthorized()   // 1. autorización
    // 2. validación de entrada
    // 3. consulta SQL parametrizada
    return NextResponse.json({ success: true })
  } catch (error) {
    return serverError("contexto", error)           // 4. error saneado
  }
}
```

| Archivo | Responsabilidad |
| :--- | :--- |
| [`lib/db.ts`](../lib/db.ts) | Pool de conexiones MySQL (máx. 10), compartido por todos los handlers |
| [`lib/auth.ts`](../lib/auth.ts) | Emisión y verificación de la cookie de sesión firmada |
| [`lib/http.ts`](../lib/http.ts) | Respuestas de error estandarizadas |
| [`lib/types.ts`](../lib/types.ts) | Tipos del dominio y conversión al formato que consume la UI |

---

## 3. Decisiones técnicas

### 3.1 Subasta por contacto, sin pasarela de pago

La decisión de producto más importante del proyecto, y la que más gente cuestiona antes de entender el contexto.

Integrar pagos habría supuesto comisiones sobre dinero donado, alta como comercio, conciliación de cobros y
responsabilidad legal sobre fondos de terceros. Para una ONG sin equipo técnico, cada una de esas piezas es una
fuente de fallos que nadie podría atender un domingo.

El dolor real no era cobrar —eso ya lo resolvían por WhatsApp— sino **perder el rastro de las pujas**. La
plataforma ataca exactamente eso y deja el cierre donde ya funcionaba.

### 3.2 Imágenes en Base64 dentro de la base de datos

Las obras se guardan como *data URI* en una columna `LONGTEXT`.

**Por qué:** no había almacenamiento de objetos disponible en el presupuesto, el sistema de archivos de Vercel es
efímero, y el intento previo —un proxy PHP alojado en el hosting para recibir las subidas— añadía una pieza más
que podía caerse (ver el historial: `HOSTINGER_upload.php`, eliminado). Meter los bytes en la fila eliminó la
dependencia externa entera: nada que expire, nada que configurar, y una copia de la base de datos incluye también
las imágenes.

**Qué cuesta**, medido contra producción:

| Métrica | Valor |
| :--- | :--- |
| Obras publicadas | 14 |
| Peso de `/api/artworks` | **6,26 MB** |
| Media por imagen | 458 KB |
| Tiempo de transferencia | ~30 s |

Antes, la galería sondeaba ese endpoint **cada 5 segundos**: una petición nueva arrancaba mucho antes de que
terminara la anterior. Hoy el sondeo es de 60 s, con revalidación al foco desactivada y `mutate()` inmediato tras
pujar, de modo que el pujador ve su propia puja al instante sin que el resto del tiempo se descargue el catálogo
en bucle.

**La corrección de fondo** —servir cada imagen desde su propio endpoint con caché HTTP y dejar el listado solo con
metadatos— está en el roadmap. La mitigación actual reduce el problema; no lo elimina.

### 3.3 Cookie de sesión firmada

Antes, la cookie contenía el UUID del administrador en crudo y el servidor solo comprobaba que ese id existiera en
la tabla. Eso demuestra que el identificador es real, **no** que la cookie la hayamos emitido nosotros: quien
obtuviera o adivinara un UUID entraba como administrador.

Ahora:

```
cookie = <adminId>.<expiración>.<HMAC-SHA256(adminId.expiración, SESSION_SECRET)>
```

La firma se compara con `crypto.timingSafeEqual` para no filtrar información por tiempo de respuesta, y la
expiración viaja dentro del valor firmado, así que no se puede alargar manipulando la cookie. Solo después de
validar la firma se consulta la base de datos, y únicamente para confirmar que el administrador sigue existiendo.

Sin dependencias nuevas: todo con `node:crypto`.

> ⚠️ `SESSION_SECRET` es obligatoria. Sin ella el inicio de sesión falla de forma explícita, en lugar de recurrir
> en silencio a un secreto débil.

### 3.4 Las pujas se resuelven dentro de una transacción

Comprobar el mínimo y escribir el nuevo precio eran dos operaciones independientes:

```
Pujador A: lee current_bid = 9000  →  valida 9500 ✓  →  escribe 9500
Pujador B: lee current_bid = 9000  →  valida 9500 ✓  →  escribe 9500
```

Peor aún, con importes distintos la segunda escritura podía **bajar** el precio de la obra. En una subasta eso es
inaceptable.

El endpoint abre ahora una transacción y bloquea la fila:

```sql
SELECT current_bid, starting_price FROM artworks
WHERE id = ? AND is_active = true
FOR UPDATE
```

El bloqueo se mantiene hasta el `COMMIT`, así que la segunda puja espera, lee el valor ya actualizado y se valida
contra él. Si algo falla, `ROLLBACK` deja la obra intacta.

### 3.5 Respuestas de error saneadas

Todos los handlers devolvían `error.message` en las respuestas 500. Un fallo de consulta filtraba nombres de
tablas, SQL y datos de conexión a cualquiera capaz de provocarlo.

[`lib/http.ts`](../lib/http.ts) centraliza las respuestas: el error real va a `console.error` con su contexto, y el
cliente recibe un mensaje genérico. Los 400 sí llevan mensaje concreto, porque describen la entrada del usuario,
no las tripas del sistema.

### 3.6 Validación de tipos activada en el build

El andamiaje inicial traía `typescript.ignoreBuildErrors: true`, y eso ocultaba dos errores reales:

1. `bid-modal.tsx` importaba `BidderInfo` desde `@/hooks/use-bidder-info`, un módulo **que no existe**. Solo
   sobrevivía por ser un `import type`, borrado en tiempo de compilación.
2. `handleBidSubmit` devolvía `undefined` en su salida temprana, incumpliendo el `Promise<boolean>` que declaraba.

Corregidos ambos —`BidderInfo` vive ahora en `lib/types.ts`—, la bandera se retiró. Un error de tipos rompe el
build, en local y en CI.

---

## 4. Seguridad

Resumen en el [README](../README.md#-seguridad). Lo que conviene subrayar:

- **Sin concatenación de SQL.** Cada consulta usa marcadores `?` de `mysql2`. No hay una sola excepción.
- **Login sin enumeración de usuarios.** Usuario inexistente y contraseña incorrecta devuelven la misma respuesta.
- **Autorización en el servidor, no en la interfaz.** La redirección del panel es comodidad; la barrera es
  `isAdmin()` dentro de cada handler.
- **`/api/migrate` ya no es público.** Ejecutaba `ALTER TABLE` sin autenticación alguna y por `GET`. Ahora exige
  sesión de administrador y es `POST`.
- **Subidas acotadas.** Lista blanca de tipos MIME y tope de 5 MB antes de convertir nada.

---

## 5. Límites conocidos

- **El catálogo pesa 6,26 MB** por las imágenes en Base64 (§3.2).
- **No hay pruebas automatizadas.** El CI valida tipos y build, que atrapan errores de compilación pero ninguna
  regresión de comportamiento.
- **Un solo rol de administrador**, sin registro de auditoría.
- **Sin límite de frecuencia** en `/api/bids`.
- **`output: "standalone"`** en `next.config.mjs` es un resto del despliegue anterior sobre Phusion Passenger. Es
  inocuo en Vercel y se dejó tal cual para no tocar una configuración de despliegue que funciona.

---

## 6. Referencias

- [`DATABASE.md`](DATABASE.md) — esquema, índices y consultas
- [`API.md`](API.md) — referencia de los 14 endpoints
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — despliegue en Vercel con MySQL remoto
