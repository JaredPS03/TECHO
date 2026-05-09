# Guía de Despliegue para Hostinger (Next.js App Router)

He configurado tu proyecto (`next.config.mjs`) en modo **Standalone** para que el código quede comprimido, súper rápido y listo para funcionar en el entorno de Node.js de Hostinger.

Para subirlo exitosamente a Hostinger, sigue estos pasos al pie de la letra:

## 1. Construir la Aplicación (Build)
Abre tu consola en la computadora y detén el servidor de desarrollo (`Ctrl` + `C`). Luego, ejecuta el siguiente comando para compilar todo el sistema:
```bash
pnpm run build
```
*(Esto creará una nueva carpeta oculta llamada `.next/standalone` que contiene tu servidor de producción listo para Hostinger).*

## 2. Preparar los Archivos para Subir
Hostinger necesita una estructura de carpetas específica. En tu computadora, crea una carpeta temporal (ej. en tu Escritorio, llamada `lista-para-subir`) y copia los siguientes archivos allí:

1. **Copia todo el contenido** que está dentro de `TECHO/.next/standalone/` y pégalo en tu carpeta temporal. (Dentro verás un archivo `server.js`).
2. **Copia la carpeta** `public/` (de tu proyecto original TECHO) y pégala dentro de tu carpeta temporal.
3. En tu carpeta temporal, verás que hay una carpeta llamada `.next`. Entra en ella y **copia la carpeta** `static/` desde tu proyecto original (`TECHO/.next/static/`) para pegarla ahí dentro. (La ruta debe quedar como `lista-para-subir/.next/static/`).
4. **Copia tu archivo** `.env` (donde tienes tu `DATABASE_URL`) y ponlo en la carpeta temporal.

## 3. Configurar Hostinger (Panel de Control)
1. Entra a tu panel de Hostinger (hPanel) y ve a la sección de **Avanzado -> Node.js**.
2. Crea una **Nueva Aplicación Node.js**:
   - **Versión de Node.js:** Selecciona la 20.x o la más actual.
   - **Modo de Aplicación:** Production.
   - **Directorio de la aplicación:** Pon el nombre de tu carpeta donde está tu dominio (usualmente `/public_html`).
   - **Archivo de inicio (Startup file):** Escribe `server.js`
3. Usando el **Administrador de Archivos de Hostinger** (o por FTP), sube **todo el contenido** de tu carpeta temporal `lista-para-subir` directamente a tu directorio `/public_html`.
4. Regresa a la sección de Node.js en Hostinger y dale al botón de **Iniciar (Start)**.

## ¿Qué acaba de cambiar en tu código para esto?
- Modifiqué `next.config.mjs` para activar `output: "standalone"`, lo que quita carpetas gigantescas (como node_modules) y optimiza la velocidad.
- Configuré todos los encabezados de seguridad HTTP nativos (XSS, HSTS, prevención de IFrames malignos) en la configuración del servidor, para que el servidor de Hostinger los aplique automáticamente.
- Se añadió un limitador de peticiones (Middleware) para bloquear cualquier intento de hackeo por fuerza bruta en tu panel de administrador.
