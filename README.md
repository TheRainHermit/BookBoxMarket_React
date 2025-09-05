# 📚 BookBox Market

BookBox Market es una plataforma web para la compra, donación y gestión de cajas de libros, desarrollada en **React + Vite** con backend serverless (Vercel) y base de datos PostgreSQL (Supabase).

---

## 🚩 Funcionalidades Actuales

### 🛒 Catálogo y Carrito de Compras
- Visualización de cajas de libros disponibles con stock actualizado en tiempo real.
- Añadir cajas al carrito y reservar stock automáticamente.
- Remover items del carrito y restaurar stock tanto en frontend como backend.
- Vaciar carrito restaura el stock de todos los productos.
- Validación de stock antes de permitir la compra.

### 💳 Proceso de Compra
- Registro de compras con autenticación JWT.
- Inserción de detalles de compra y actualización de stock.
- Envío de correo de confirmación al usuario.
- Sistema de puntos por compra.
- Otorgamiento automático de insignias por hitos de compras o gasto.

### 🤝 Donaciones
- Formulario para donar libros, con registro de libros y donaciones.
- Suma de puntos y posibles insignias al donar.
- Envío de correo de agradecimiento por donación.

### 🏆 Insignias y Ranking
- Sistema de insignias desbloqueables por actividad.
- Consulta y verificación de insignias obtenidas.
- Ranking de usuarios por puntos (puede estar temporalmente deshabilitado por límite de endpoints).

### 🔒 Seguridad y Backend
- Autenticación JWT en todas las rutas protegidas.
- Endpoints serverless en Vercel (máximo 12 en plan Hobby).
- Base de datos PostgreSQL gestionada en Supabase.
- Emails transaccionales usando Nodemailer y Gmail.

---

## ⚠️ Límite de Endpoints Serverless
Debido al plan Hobby de Vercel, el proyecto está limitado a **12 endpoints serverless**. Actualmente, todas las funcionalidades críticas están cubiertas, pero futuras expansiones requerirán consolidar endpoints o migrar a un plan superior.

---

## 🔮 Futuras Actualizaciones
- Consolidación de endpoints para liberar espacio y permitir nuevas funcionalidades.
- Panel de administración para gestionar stock, usuarios y donaciones.
- Historial de compras y donaciones para cada usuario.
- Soporte para múltiples cantidades por caja en el carrito.
- Mejoras al sistema de notificaciones y correos.
- API pública documentada con Swagger (archivos y endpoints ya preparados).
- Soporte para pagos reales (integración con pasarelas de pago).
- Mejoras de accesibilidad y experiencia de usuario.

---

## 🧑‍💻 Stack Tecnológico
- **Frontend:** React, Vite, Context API, CSS Modules
- **Backend:** Serverless Functions (Vercel)
- **Base de datos:** PostgreSQL (Supabase)
- **Autenticación:** JWT
- **Email:** Nodemailer + Gmail
- **Documentación API:** Swagger (ver `/src/future_endpoints_backup/`)

---

## 🗂️ Estructura Principal del Proyecto

```text
/api
  /compra.js
  /donaciones.js
  /libros.js
  /insignias/
  /inventario/
  /usuarios/
  ...
/src
  /pages/
    Catalogo.jsx
    Carrito.jsx
    Donar.jsx
    PerfilUsuario.jsx
  /context/
  /providers/
```

---

## 📌 Consideraciones y Notas
- El stock se reserva al agregar al carrito y se libera si se elimina el producto antes de comprar.
- Todas las rutas protegidas requieren autenticación JWT.
- El sistema de insignias y puntos es extensible y fácilmente configurable.
- El proyecto está preparado para migrar a un plan superior de Vercel o a un backend dedicado si se requieren más endpoints.

---

## 🏷️ Créditos y Licencia
Desarrollado por Miguel Angel Fabra Montaño - TheRainHermit.  
© 2024 - 2025, BookBox Market. Todos los derechos reservados.

---

## 🚀 Instrucciones de Despliegue y Uso Local

### Requisitos previos
- Node.js >= 18
- Una cuenta en Vercel y Supabase
- Acceso a una cuenta de Gmail para el envío de correos (o adaptar a otro proveedor)

### Instalación local

```bash
git clone https://github.com/TheRainHermit/BookBoxMarket_React.git
cd BookBoxMarket_React
npm install
```

### Variables de entorno necesarias
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
ACCESS_SECRET=tu_clave_jwt
SUPABASE_DB_URL=postgresql://usuario:contraseña@host:puerto/base
GMAIL_USER=tu_correo@gmail.com
GMAIL_PASS=tu_contraseña_app_gmail
```

Asegúrate de configurar estos valores también en Vercel (Dashboard > Project > Settings > Environment Variables).

### Correr en desarrollo

```bash
npm run dev
```

La app estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 🛠️ Despliegue en Producción
1. Sube el proyecto a un repositorio en GitHub.
2. Conecta el repo a Vercel y configura las variables de entorno.
3. Vercel detectará el framework (Vite + React) y desplegará automáticamente.
4. La base de datos debe estar accesible desde la nube (usa Supabase o configura CORS/firewall).

---

## 🧩 Estructura de la base de datos
Consulta el archivo `/src/db/pg/pgPool.js` y los scripts SQL de Supabase para detalles de las tablas:
- `users`, `libros`, `compra`, `d_compra`, `donaciones`, `puntos_usuario`, `insignias`, `insignias_usuario`, etc.

---

## 📝 Contribución
¡Las contribuciones son bienvenidas!

1. Haz un fork del repositorio.
2. Crea una rama nueva: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y haz commit.
4. Haz push a tu fork y abre un Pull Request.

---

## 📨 Contacto y Soporte
Para soporte, sugerencias o reportar bugs, abre un issue en el repositorio o contacta a:
- **Email:** therainhermit@gmail.com
- **GitHub:** [TheRainHermit](https://github.com/TheRainHermit)