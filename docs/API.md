# API Reference — Subasta de Arte con Causa

> [← Volver al README](../README.md) · [Back to README (EN)](../README.en.md)

14 *route handlers* bajo `app/api/`, ejecutados en el servidor. Dos públicos y doce protegidos.

---

## Autenticación

Todo lo que cuelga de `/api/admin/*`, más `/api/migrate`, exige una sesión de administrador válida. La sesión es
una cookie `httpOnly` emitida por `/api/admin/login`:

```
admin_session = <adminId>.<expiraEn>.<HMAC-SHA256(adminId.expiraEn, SESSION_SECRET)>
```

`isAdmin()` ([`lib/auth.ts`](../lib/auth.ts)) verifica la firma en tiempo constante, comprueba la expiración y solo
entonces confirma contra la base de datos que el administrador sigue existiendo. Sin cookie válida, la respuesta es
`401 Unauthorized`.

## Convenciones

| Aspecto | Convención |
| :--- | :--- |
| Formato | JSON en petición y respuesta |
| Éxito en mutaciones | `{ "success": true }` |
| Validación fallida | `400` con `{ "error": "<mensaje concreto>" }` |
| Sin sesión | `401` con `{ "error": "Unauthorized" }` |
| No encontrado | `404` con `{ "error": "<mensaje>" }` |
| Error de servidor | `500` con un mensaje **genérico**; el detalle va al log del servidor |

---

# Endpoints públicos

## `GET /api/artworks`

Catálogo de obras activas (`is_active = true`), de más reciente a más antigua.

```jsonc
[
  {
    "id": "b79e45bf-4da2-11f1-90e2-4b81a5b9af43",
    "title": "S/T",
    "artist": "JOSÉ SANTOS",
    "technique": "CERÁMICA BAJA TEMPERATURA",
    "dimensions": "35 CMS ALTO X 105 CMS CIRCUNFERENCIA",
    "year": "2018",
    "description": null,
    "starting_price": "9000.00",
    "current_bid": "0.00",
    "image_url": "data:image/jpeg;base64,/9j/4QDKRXhpZgAA...",
    "is_active": 1,
    "created_at": "2026-05-09T18:22:41.000Z",
    "updated_at": "2026-05-09T18:22:41.000Z"
  }
]
```

> ⚠️ **Este endpoint es pesado.** `image_url` contiene la imagen completa en Base64: en producción son
> **6,26 MB para 14 obras**. El cliente lo sondea cada 60 s, no cada 5 s como hacía antes. La corrección de fondo
> está en el roadmap; el análisis completo, en [`ARCHITECTURE.md § 3.2`](ARCHITECTURE.md#32-imágenes-en-base64-dentro-de-la-base-de-datos).

`starting_price` y `current_bid` llegan como cadenas: es como `mysql2` devuelve las columnas `DECIMAL` para no
perder precisión. `toArtworkDisplay()` en [`lib/types.ts`](../lib/types.ts) los normaliza a número y resuelve la
puja mostrada como `max(current_bid, starting_price)`.

## `POST /api/bids`

Registra una puja. Es el único endpoint público que escribe.

```jsonc
// Petición
{
  "artwork_id": "b79e45bf-4da2-11f1-90e2-4b81a5b9af43",
  "amount": 9500,
  "bidder_name": "Nombre Apellido",
  "bidder_whatsapp": "+52 951 000 0000",
  "bidder_email": "persona@ejemplo.com"
}

// 200
{ "success": true }
```

**Validaciones, en orden:**

| Comprobación | Respuesta si falla |
| :--- | :--- |
| Todos los campos presentes | `400 Missing required fields` |
| `amount` numérico y positivo | `400 Invalid amount format` |
| Correo con formato válido | `400 Invalid email address` |
| La obra existe y está activa | `404 Artwork not found` |
| `amount ≥ max(current_bid, starting_price) + 500` | `400 Bid must be at least $<mínimo>` |

Los campos de texto se recortan a la anchura de su columna (255 / 50 / 255) para que una entrada demasiado larga
devuelva un `400` en lugar de reventar como error de base de datos.

**Atomicidad.** La secuencia leer-validar-escribir ocurre dentro de una transacción que bloquea la fila de la obra
con `SELECT ... FOR UPDATE`. Sin ese bloqueo, dos pujas simultáneas podían validarse contra el mismo `current_bid`
obsoleto y la segunda escritura acababa **bajando** el precio.

```
BEGIN
  SELECT ... FROM artworks WHERE id = ? AND is_active = true FOR UPDATE
  (validar mínimo)
  INSERT INTO bids ...
  UPDATE artworks SET current_bid = ...
COMMIT
```

---

# Endpoints de administración

## `POST /api/admin/login`

```jsonc
// Petición
{ "email": "admin@ejemplo.org", "password": "..." }

// 200 — emite la cookie admin_session
{ "success": true, "admin": { "id": "...", "email": "admin@ejemplo.org" } }

// 401 — mismo mensaje para usuario inexistente y contraseña incorrecta
{ "error": "Invalid credentials" }
```

La respuesta idéntica en ambos casos de fallo es deliberada: el endpoint no revela qué correos están registrados.
La contraseña se compara con `bcrypt.compare` contra el hash almacenado.

> Requiere `SESSION_SECRET` en el entorno. Sin ella, el login devuelve `500` y el error queda en el log del
> servidor.

## `POST /api/admin/logout`
Borra la cookie de sesión. Siempre `{ "success": true }`.

## `GET /api/admin/session`

```jsonc
// 200
{ "authenticated": true, "admin": { "id": "...", "email": "..." } }

// 401
{ "authenticated": false }
```

## `GET /api/admin/artworks`
Todas las obras, **incluidas las inactivas** — a diferencia del endpoint público. Mismo formato de fila.

## `POST /api/admin/artworks`

```jsonc
{
  "title": "S/T",                    // obligatorio
  "artist": "JOSÉ SANTOS",           // obligatorio
  "technique": "CERÁMICA",           // obligatorio
  "dimensions": "35 x 105 CMS",
  "year": "2018",
  "description": null,
  "starting_price": 9000,
  "image_url": "data:image/jpeg;base64,..."
}
```

La obra se crea con `current_bid = 0` e `is_active = true`. Falta alguno de los tres obligatorios →
`400 Title, artist, and technique are required`.

## `PUT /api/admin/artworks/[id]`
Actualiza todos los campos editables de una obra, incluido `is_active` para retirarla del catálogo público sin
borrarla.

## `DELETE /api/admin/artworks/[id]`
Elimina la obra. Sus pujas se borran en cascada (`ON DELETE CASCADE`), así que la operación es irreversible.

## `GET /api/admin/bids`

Todas las pujas, más recientes primero, con la obra asociada resuelta en la misma consulta (`LEFT JOIN`) para
evitar el problema N+1.

```jsonc
[
  {
    "id": "...",
    "artwork_id": "...",
    "amount": "9500.00",
    "bidder_name": "Nombre Apellido",
    "bidder_whatsapp": "+52 951 000 0000",
    "bidder_email": "persona@ejemplo.com",
    "created_at": "2026-05-10T12:00:00.000Z",
    "artwork": { "id": "...", "title": "S/T", "artist": "JOSÉ SANTOS", "image_url": "data:image/..." }
  }
]
```

> 🔒 Esta respuesta contiene datos personales de los pujadores (nombre, teléfono y correo). Es la razón por la que
> el endpoint está detrás de sesión y por la que la verificación de la cookie tenía que dejar de ser un simple
> "¿existe este id?".

## `POST /api/admin/upload`

`multipart/form-data` con un campo `file`. Devuelve la imagen como *data URI* — **no** la guarda: quien la
persiste es el `POST`/`PUT` de la obra.

| Validación | Límite |
| :--- | :--- |
| Tipo MIME | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| Tamaño | 5 MB |

```jsonc
{ "url": "data:image/jpeg;base64,/9j/4QDKRXhpZgAA..." }
```

## `POST /api/migrate`

Migración puntual: amplía `artworks.image_url` a `LONGTEXT` para que quepa un data URI. Idempotente.

Era `GET` y **sin autenticación alguna** — un endpoint público que ejecutaba DDL. Ahora exige sesión de
administrador y usa `POST`, porque una operación que modifica el esquema no puede viajar en un método que los
navegadores y los rastreadores invocan solos.
