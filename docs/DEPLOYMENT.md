# Despliegue — Subasta de Arte con Causa

> [← Volver al README](../README.md) · [Back to README (EN)](../README.en.md)

La arquitectura separa aplicación y base de datos:

| Pieza | Dónde | Por qué |
| :--- | :--- | :--- |
| **Aplicación Next.js** | Vercel | Despliegue continuo desde `main`, gratuito y optimizado para Next.js |
| **Base de datos MySQL** | Hosting de la organización (Hostinger) | Ya estaba contratado; cero coste adicional |

El plan de hosting contratado no soporta Node.js, así que alojar ahí la aplicación no era viable. Separar las dos
piezas resolvió el problema sin gastar nada más.

---

## Fase 1 — Preparar MySQL para acceso remoto

Vercel se conecta a la base de datos desde fuera del hosting, así que hay que permitir conexiones externas.

1. Entra al **hPanel** de Hostinger.
2. Ve a **Bases de datos → Bases de datos MySQL**.
3. Crea la base de datos (o usa la existente). Anota **nombre, usuario y contraseña**.
4. Ve a **Bases de datos → MySQL remoto**.
5. En **IP remota** escribe `%`. Las IP de salida de Vercel son dinámicas, así que restringir por IP no es
   practicable en el plan gratuito.
6. Selecciona tu base de datos y pulsa **Crear**.
7. Anota el **host MySQL** (una IP o un dominio tipo `sqlXXX.hostinger.io`), visible en la ficha de la base de
   datos.

> ⚠️ Abrir el acceso con `%` significa que cualquier IP puede *intentar* conectarse. La contraseña de la base de
> datos pasa a ser la única barrera: que sea larga y única, y no la reutilices en ningún otro sitio.

### Crear el esquema

Desde tu máquina, apuntando al MySQL remoto:

```bash
MYSQL_HOST=<host-de-hostinger> \
MYSQL_USER=<usuario> \
MYSQL_PASSWORD=<contraseña> \
MYSQL_DATABASE=<nombre-bd> \
pnpm db:setup
```

O importando [`database.sql`](../database.sql) desde phpMyAdmin en el hPanel.

### Crear el usuario administrador

```bash
MYSQL_HOST=<host> MYSQL_USER=<usuario> MYSQL_PASSWORD=<contraseña> MYSQL_DATABASE=<bd> \
ADMIN_EMAIL=admin@tudominio.org \
ADMIN_PASSWORD='<contraseña larga y única>' \
pnpm db:admin
```

El script guarda únicamente el hash bcrypt. Ejecutarlo de nuevo con el mismo correo **cambia la contraseña**: es
también el procedimiento de rotación.

---

## Fase 2 — Desplegar en Vercel

1. En [vercel.com](https://vercel.com), **Add New → Project** e importa el repositorio de GitHub.
2. **Framework Preset:** Vercel detecta Next.js automáticamente. Déjalo como está.
3. Declara las **variables de entorno**:

| Variable | Valor |
| :--- | :--- |
| `MYSQL_HOST` | Host MySQL de Hostinger |
| `MYSQL_PORT` | `3306` (opcional) |
| `MYSQL_USER` | Usuario de la base de datos |
| `MYSQL_PASSWORD` | Contraseña de la base de datos |
| `MYSQL_DATABASE` | Nombre de la base de datos |
| `SESSION_SECRET` | Cadena aleatoria de 32+ caracteres |

Genera el secreto de sesión con:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> ⚠️ **`SESSION_SECRET` es obligatoria.** Firma la cookie del panel de administración. Si falta, el inicio de
> sesión devuelve error 500 — a propósito: es preferible fallar de forma visible que recurrir en silencio a un
> secreto débil.
>
> Los nombres correctos son `MYSQL_*`. Versiones antiguas de esta guía mencionaban `DB_*`, que
> [`lib/db.ts`](../lib/db.ts) nunca ha leído.

4. Pulsa **Deploy**.

Cada push a `main` vuelve a desplegar automáticamente.

---

## Fase 3 — Dominio propio

1. En Vercel: **Settings → Domains**, añade el dominio.
2. Vercel devuelve un registro **A** y/o un **CNAME**.
3. En Hostinger: **Dominios → Editor de zona DNS**.
4. Sustituye los registros A/CNAME que apuntaban al hosting web por los que indica Vercel.
5. La propagación tarda de minutos a unas horas. Vercel emite el certificado TLS solo.

El dominio en producción es [`techoax.art`](https://www.techoax.art/).

---

## Rotar la contraseña de administración

Hazlo si sospechas que la credencial se expuso — por ejemplo, si alguna vez estuvo escrita en un archivo
versionado. **Borrar el archivo no basta: el historial de git conserva su contenido.**

```bash
MYSQL_HOST=<host> MYSQL_USER=<usuario> MYSQL_PASSWORD=<contraseña> MYSQL_DATABASE=<bd> \
ADMIN_EMAIL=<el correo existente> \
ADMIN_PASSWORD='<contraseña nueva>' \
pnpm db:admin
```

Rotar además `SESSION_SECRET` en Vercel invalida de golpe todas las sesiones abiertas.

---

## Verificación posterior al despliegue

```bash
# El catálogo responde (ojo: la respuesta ronda los 6 MB)
curl -s -o /dev/null -w "%{http_code} %{size_download} bytes\n" https://www.techoax.art/api/artworks

# Los endpoints de administración rechazan a quien no tiene sesión
curl -s -o /dev/null -w "%{http_code}\n" https://www.techoax.art/api/admin/bids     # esperado: 401
curl -s -o /dev/null -w "%{http_code}\n" https://www.techoax.art/api/admin/artworks # esperado: 401

# Las cabeceras de seguridad están presentes
curl -sI https://www.techoax.art/ | grep -iE "strict-transport|x-frame|x-content-type|referrer-policy"
```

Y una comprobación manual: entra en `/admin`, inicia sesión y confirma que el listado de obras y el de pujas
cargan.

---

## Problemas frecuentes

| Síntoma | Causa probable |
| :--- | :--- |
| `500` al iniciar sesión | Falta `SESSION_SECRET` en Vercel, o tiene menos de 32 caracteres |
| Sesión cerrada tras desplegar | `SESSION_SECRET` cambió: las cookies firmadas con el valor anterior dejan de ser válidas. Vuelve a iniciar sesión |
| `ETIMEDOUT` / `ECONNREFUSED` | Falta el acceso remoto (`%`) en MySQL remoto, o el host es incorrecto |
| Catálogo vacío pero sin error | No hay obras con `is_active = true` |
| El catálogo tarda mucho | Comportamiento conocido: las imágenes van en Base64 dentro de la respuesta (~6 MB). Ver [`ARCHITECTURE.md § 3.2`](ARCHITECTURE.md#32-imágenes-en-base64-dentro-de-la-base-de-datos) |
| `Data too long for column 'image_url'` | La columna sigue siendo `TEXT`. Inicia sesión como administrador y llama a `POST /api/migrate` |
