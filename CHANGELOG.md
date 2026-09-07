# Changelog

> [← Volver al README](README.md) · [Back to README (EN)](README.en.md)

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/); versionado según
[SemVer](https://semver.org/lang/es/).

---

## [1.0.0] — 2026-09-07

Endurecimiento de seguridad, corrección de errores reales y primera versión documentada.

### Seguridad
- **Eliminadas credenciales del repositorio.** `hostinger_db.sql` contenía la contraseña de administración en un
  comentario en texto plano junto a su hash bcrypt, y `update-db.mjs` sembraba una contraseña por defecto fija.
  La creación de administradores pasa a [`scripts/create-admin.mjs`](scripts/create-admin.mjs), que lee
  `ADMIN_EMAIL` y `ADMIN_PASSWORD` del entorno y rechaza contraseñas de menos de 12 caracteres.
- **Sesión de administración firmada.** La cookie guardaba el UUID del administrador en crudo: quien lo obtuviera
  o adivinara entraba como admin. Ahora es `<adminId>.<expiración>.<HMAC-SHA256>` firmada con `SESSION_SECRET`,
  comparada en tiempo constante y con expiración dentro del valor firmado.
- **`/api/migrate` protegido.** Ejecutaba `ALTER TABLE` sin autenticación alguna y por `GET`. Ahora exige sesión
  de administrador y usa `POST`.
- **Errores saneados.** Todos los handlers devolvían `error.message` en las respuestas 500, exponiendo SQL,
  nombres de tabla y datos de conexión. El detalle va al log del servidor y el cliente recibe un mensaje genérico.
- **Login sin enumeración de usuarios:** misma respuesta ante usuario inexistente y contraseña incorrecta.

### Corregido
- **Condición de carrera en las pujas.** La validación del mínimo y la escritura del precio eran operaciones
  sueltas: dos pujas simultáneas podían validarse contra el mismo `current_bid` obsoleto y la segunda escritura
  llegaba a **bajar** el precio. Ahora se resuelven en una transacción con `SELECT ... FOR UPDATE`.
- **Import roto.** `bid-modal.tsx` importaba `BidderInfo` desde `@/hooks/use-bidder-info`, un módulo inexistente;
  sobrevivía solo por ser un `import type`. El tipo vive ahora en `lib/types.ts` y `artwork-gallery.tsx` deja de
  declarar su propia copia.
- **`handleBidSubmit`** devolvía `undefined` en su salida temprana, incumpliendo el `Promise<boolean>` declarado.
- **Validación de entrada en las pujas:** campos recortados a la anchura de sus columnas y correo validado, de
  modo que una entrada inválida devuelve `400` en lugar de un error de base de datos.
- **Guía de despliegue:** documentaba variables `DB_*` que [`lib/db.ts`](lib/db.ts) nunca ha leído; las correctas
  son `MYSQL_*`.

### Rendimiento
- **El catálogo dejó de descargarse cada 5 segundos.** `/api/artworks` incluye las imágenes en Base64: medido
  contra producción son **6,26 MB para 14 obras** (~30 s de transferencia). El sondeo pasa a 60 s, sin
  revalidación al foco, y la galería sigue llamando a `mutate()` justo después de una puja para que el pujador vea
  la suya al instante. Es una mitigación; la corrección de fondo está en el roadmap.

### Añadido
- README bilingüe (español e inglés) con diagramas de arquitectura y modelo entidad-relación, decisiones técnicas
  y límites conocidos.
- Documentación técnica en `docs/`: arquitectura, modelo de datos, referencia de la API y despliegue.
- Integración continua en GitHub Actions: *type-check* y build de producción en cada push y pull request.
- Plantillas de issue y de pull request.
- Licencia propietaria bilingüe.
- Scripts `db:setup` y `db:admin`; `typecheck` sustituye al script `lint`, que estaba roto (`eslint` nunca fue una
  dependencia).

### Cambiado
- **Validación de tipos activada en el build**: retirado `typescript.ignoreBuildErrors`, que ocultaba los dos
  errores corregidos arriba.
- Metadatos reales en `package.json` y `.gitignore` reescrito.

### Eliminado
- `app.js` y `HOSTINGER_upload.php`: punto de entrada de Phusion Passenger y proxy PHP de subida, inalcanzables
  desde el paso a Vercel.
- `lib/supabase/*`: nunca fue importado por nada.
- `middleware.ts`: un *pass-through* vacío desde que se retiró el limitador de peticiones.
- `hostinger_db.sql`: esquema duplicado y divergente; la fuente única es `database.sql`.
- Dependencias sin usar: `xss`, `helmet`, `express-rate-limit`, `zod` y `@supabase/ssr`.

---

## [0.4.0] — 2026-05-09

### Cambiado
- Las imágenes pasan a almacenarse como Base64 en MySQL, eliminando la dependencia del hosting externo para las
  subidas. Se muestran las dimensiones de cada obra.
- Retirado el limitador de peticiones del middleware, que no funcionaba.

## [0.3.0] — 2026-05-08

### Añadido
- Proxy PHP en el hosting para las subidas de imagen, sorteando los límites de tamaño de Vercel.
- Registro detallado de errores en la carga de imágenes.

### Corregido
- Carga de imágenes convertida a payload JSON en Base64 para sortear un fallo con `FormData`.

## [0.2.0] — 2026-05-08

### Añadido
- Preparación del proyecto para desplegar en Vercel con la base de datos en Hostinger.
- Guía de despliegue.

## [0.1.0] — 2026-05-08

### Añadido
- Catálogo público de obras con búsqueda y vista ampliada.
- Pujas por contacto con validación de incremento mínimo.
- Panel de administración: gestión de obras, carga de imágenes y listado de pujas.
- Autenticación de administradores con bcrypt.
- Esquema MySQL: `artworks`, `bids` y `admin_users`.

[1.0.0]: https://github.com/JaredPS03/TECHO/releases/tag/v1.0.0
