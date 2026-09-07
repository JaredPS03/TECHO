# Documentación — Subasta de Arte con Causa

> [← Volver al README](../README.md) · [Back to README (EN)](../README.en.md)

| Documento | Contenido |
| :--- | :--- |
| [**ARCHITECTURE.md**](ARCHITECTURE.md) | Cómo está construida la plataforma y **por qué**: capas, subasta por contacto, imágenes en Base64 y su coste medido, sesión firmada, transacción de pujas, límites conocidos |
| [**DATABASE.md**](DATABASE.md) | Las tres tablas al detalle: columnas, tipos, desnormalización deliberada, índices y las consultas destacadas |
| [**API.md**](API.md) | Referencia de los 14 endpoints: autenticación, payloads, validaciones y códigos de error |
| [**DEPLOYMENT.md**](DEPLOYMENT.md) | Despliegue en Vercel con MySQL remoto, variables de entorno, rotación de credenciales y verificación posterior |

## Recorrido sugerido

Si vienes a evaluar el proyecto y tienes cinco minutos:

1. **[Cómo funciona](../README.md#-cómo-funciona)** en el README — la decisión de producto que define el sistema
   es que no hay pasarela de pago.
2. [`app/api/bids/route.ts`](../app/api/bids/route.ts) — validación de puja dentro de una transacción con
   `SELECT ... FOR UPDATE`.
3. [`lib/auth.ts`](../lib/auth.ts) — la sesión firmada con HMAC que sustituyó a un identificador en crudo.
4. [`ARCHITECTURE.md § 3`](ARCHITECTURE.md#3-decisiones-técnicas) — las decisiones, sus porqués y lo que cuestan,
   incluido lo que todavía no está resuelto.
