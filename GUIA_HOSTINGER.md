# Guía de Despliegue: Next.js en Vercel + Base de Datos en Hostinger

Ya que tu plan de Hostinger no soporta Node.js, la mejor arquitectura (y la más profesional) es separar el Frontend/Backend de la Base de Datos.

**Arquitectura recomendada:**
1. **Página Web y API (Next.js):** Alojado en **Vercel** (Gratis, optimizado para Next.js).
2. **Base de Datos (MySQL):** Alojado en **Hostinger** (Tu plan actual).

Sigue estos pasos detallados para lograrlo:

---

## FASE 1: Preparar la Base de Datos en Hostinger

Vercel necesita conectarse a tu base de datos de Hostinger. Para esto, debes permitir que conexiones externas (fuera de Hostinger) puedan acceder a tu base de datos.

1. Entra a tu **hPanel** (Panel de Hostinger).
2. Ve a la sección **Bases de Datos -> Bases de Datos MySQL**.
3. **Crea una nueva base de datos** (o usa una existente). Anota el Nombre de la BD, Usuario y Contraseña.
4. Ve a la sección **Bases de Datos -> MySQL Remoto** (Remote MySQL).
5. En la opción "IP Remota" (Remote IP), ingresa `%` (un símbolo de porcentaje). Esto permite que Vercel se conecte sin importar qué IP use (ya que las IPs de Vercel son dinámicas).
6. Selecciona tu base de datos y dale a **Crear/Añadir**.
7. Ahora, averigua la **IP de tu servidor MySQL** de Hostinger. Suele estar en la parte superior de la página de Bases de Datos o en la información de tu cuenta (Suele ser una IP numérica como `193.168.x.x` o un dominio como `sql.hostinger.com`).

**Tu archivo `.env` local y en producción se verá así:**
```env
DB_HOST=LA_IP_DE_HOSTINGER_O_DOMINIO_SQL
DB_USER=tu_usuario_creado
DB_PASSWORD=tu_contrasena_creada
DB_NAME=tu_nombre_de_bd
```

---

## FASE 2: Subir tu Código a GitHub

Vercel se conecta con GitHub para desplegar tu página automáticamente cada vez que haces un cambio.

1. Ve a [GitHub.com](https://github.com/) y crea una cuenta si no tienes.
2. Crea un **Nuevo Repositorio** (privado o público). No le agregues README ni `.gitignore`.
3. Abre la terminal en tu computadora (dentro de tu proyecto `TECHO`) y ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Primer commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
   *(Asegúrate de cambiar la URL por la de tu repositorio).*

---

## FASE 3: Desplegar en Vercel

1. Ve a [Vercel.com](https://vercel.com/) y regístrate usando tu cuenta de GitHub.
2. Haz clic en **"Add New..."** -> **"Project"**.
3. Te aparecerá una lista con tus repositorios de GitHub. Busca el que acabas de crear y dale al botón **"Import"**.
4. En la pantalla de configuración del proyecto:
   - **Framework Preset:** Vercel detectará automáticamente que es `Next.js`. Déjalo así.
   - **Environment Variables:** Aquí debes agregar las variables de entorno para que tu app se conecte a Hostinger. Copia y pega las credenciales que anotamos en la FASE 1:
     - Nombre: `DB_HOST`, Valor: `(La IP de Hostinger)` -> Add
     - Nombre: `DB_USER`, Valor: `(Tu usuario)` -> Add
     - Nombre: `DB_PASSWORD`, Valor: `(Tu contraseña)` -> Add
     - Nombre: `DB_NAME`, Valor: `(El nombre de tu BD)` -> Add
5. Haz clic en **"Deploy"**.

Vercel instalará todo, compilará la app (¡el `output: "standalone"` no molesta aquí, Vercel lo optimiza automáticamente!) y te dará una URL (ej. `tu-proyecto.vercel.app`) donde tu web ya estará viva y conectada a la base de datos de Hostinger.

---

## FASE 4 (Opcional pero recomendado): Usar tu Dominio de Hostinger en Vercel

Si compraste el dominio `mi-subasta.com` en Hostinger y quieres que apunte a tu nueva web en Vercel:

1. Ve al panel de control de tu proyecto en **Vercel** -> **Settings** -> **Domains**.
2. Escribe tu dominio (ej. `mi-subasta.com`) y dale a Add.
3. Vercel te dará unos registros de tipo **A** (una IP) y **CNAME** (ej. `cname.vercel-dns.com`).
4. Ve a tu panel de **Hostinger**, entra en la sección **Dominios -> Editor de Zona DNS**.
5. Borra los registros A o CNAME antiguos que apuntaban al hosting web, y agrega los nuevos que te dio Vercel.
6. ¡Listo! En unas pocas horas (o minutos), al entrar a tu dominio cargará la aplicación de Vercel a la perfección.
