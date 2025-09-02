-- Adaptación para PostgreSQL/Supabase

-- Tabla: cajas
CREATE TABLE cajas (
  id_caja SERIAL PRIMARY KEY,
  nombre_caja VARCHAR(255) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  precio DOUBLE PRECISION NOT NULL,
  cantidad_libros INTEGER NOT NULL
);

INSERT INTO cajas (nombre_caja, descripcion, precio, cantidad_libros) VALUES
('Caja Oculta', 'Todo será completamente aleatorio', 100000, 5),
('Caja Misteriosa', 'Hay un 50% de probabilidad de que los libros que aprezcan en la caja sean en base a tus preferencias', 150000, 5),
('Caja Sospechosa', 'Hay un 80% de probabilidad de que los libros que aparezcan en la caja sean en base a tus preferencias. Por lo menos un libro será garantizado de una de tus preferencias', 250000, 5);

-- Tabla: users
CREATE TABLE users (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(45) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(255) NOT NULL,
  pais VARCHAR(255) NOT NULL,
  codigo_postal VARCHAR(45),
  fecha_nto DATE NOT NULL,
  preferencias_literarias VARCHAR(255)
);

-- Tabla: libros
CREATE TABLE libros (
  id_libro SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  autor VARCHAR(255) NOT NULL,
  editorial VARCHAR(255),
  anio_publicacion VARCHAR(255),
  genero VARCHAR(255) NOT NULL,
  estado VARCHAR(255) NOT NULL
);

INSERT INTO libros (titulo, autor, editorial, anio_publicacion, genero, estado) VALUES
('Cien años de soledad', 'Gabriel García Márquez', 'Norma', '1967', 'Novela', 'Usado'),
('El Principito', 'Antoine de Saint-Exupéry', 'Norma', '1943', 'Fantasía', 'Nuevo'),
('1984', 'George Orwell', 'Norma', '1949', 'Distopía', 'Usado'),
('Matar a un ruiseñor', 'Harper Lee', 'Norma', '1960', 'Drama', 'Nuevo');

-- Tabla: compra
CREATE TABLE compra (
  id_compra SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES users(id_usuario),
  fecha_compra DATE NOT NULL,
  metodo_pago VARCHAR(255) NOT NULL
);

-- Tabla: d_compra
CREATE TABLE d_compra (
  id_compra INTEGER NOT NULL REFERENCES compra(id_compra) ON DELETE CASCADE,
  id_caja INTEGER NOT NULL REFERENCES cajas(id_caja),
  linia INTEGER NOT NULL,
  PRIMARY KEY (id_compra, linia)
);

-- Tabla: donaciones
CREATE TABLE donaciones (
  id_donacion SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES users(id_usuario),
  libro_id INTEGER NOT NULL REFERENCES libros(id_libro),
  fecha_donacion DATE NOT NULL,
  estado_donacion VARCHAR(45) NOT NULL
);

-- Tabla: inventario
CREATE TABLE inventario (
  id_caja INTEGER PRIMARY KEY REFERENCES cajas(id_caja),
  stock INTEGER NOT NULL DEFAULT 0
);

INSERT INTO inventario (id_caja, stock) VALUES
(1, 100),
(2, 100),
(3, 100);

-- Tabla: suscriptores
CREATE TABLE suscriptores (
  id_suscriptor SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255),
  fecha_suscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT TRUE,
  id_usuario INTEGER REFERENCES users(id_usuario)
);

-- Tabla: puntos_usuario
CREATE TABLE puntos_usuario (
  id_usuario INTEGER PRIMARY KEY REFERENCES users(id_usuario),
  puntos INTEGER DEFAULT 0
);

-- Tabla: insignias
CREATE TABLE insignias (
  id_insignia SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  icono VARCHAR(255)
);

INSERT INTO insignias (nombre, descripcion, icono) VALUES
('Primer libro donado', '¡Bienvenido a la comunidad de donantes!', '📚'),
('Donador frecuente', 'Has donado 5 libros o más', '🏆'),
('Comprador estrella', 'Primera compra exitosa', '⭐'),
('Coleccionista', 'Has comprado 10 o más libros', '📖');

-- Tabla: insignias_usuario
CREATE TABLE insignias_usuario (
  id_usuario INTEGER NOT NULL REFERENCES users(id_usuario),
  id_insignia INTEGER NOT NULL REFERENCES insignias(id_insignia),
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario, id_insignia)
);