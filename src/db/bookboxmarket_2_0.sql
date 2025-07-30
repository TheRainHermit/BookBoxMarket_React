-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-11-2024 a las 00:06:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `bookboxmarket`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cajas`
--

CREATE TABLE `cajas` (
  `id_caja` int(11) NOT NULL,
  `nombre_caja` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `precio` double NOT NULL,
  `cantidad_libros` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `cajas`(`nombre_caja`, `descripcion`, `precio`, `cantidad_libros`) VALUES ('Caja Oculta','Todo será completamente aleatorio','100000','5');

INSERT INTO `cajas`(`nombre_caja`, `descripcion`, `precio`, `cantidad_libros`) VALUES ('Caja Misteriosa','Hay un 50% de probabilidad de que los libros que aprezcan en la
              caja sean en base a tus preferencias','150000','5');

INSERT INTO `cajas`(`nombre_caja`, `descripcion`, `precio`, `cantidad_libros`) VALUES ('Caja Sospechosa','Hay un 80% de probabilidad de que los libros que aparezcan en la
              caja sean en base a tus preferencias. Por lo menos un libro será
              garantizado de una de tus preferencias','250000','5');
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compra`
--

CREATE TABLE `compra` (
  `id_compra` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_compra` date NOT NULL,
  `metodo_pago` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `donaciones`
--

CREATE TABLE `donaciones` (
  `id_donacion` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `libro_id` int(11) NOT NULL,
  `fecha_donacion` date NOT NULL,
  `estado_donacion` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `d_compra`
--

CREATE TABLE `d_compra` (
  `id_compra` int(11) NOT NULL,
  `id_caja` int(11) NOT NULL,
  `linia` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libros`
--

CREATE TABLE `libros` (
  `id_libro` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) NOT NULL,
  `editorial` varchar(255) DEFAULT NULL,
  `anio_publicacion` varchar(255) DEFAULT NULL,
  `genero` varchar(255) NOT NULL,
  `estado` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `libros`(`titulo`, `autor`, `editorial`, `anio_publicacion`, `genero`, `estado`) VALUES ('Cien años de soledad','Gabriel García Márquez','Norma','1967','Novela','Usado');

INSERT INTO `libros`(`titulo`, `autor`, `editorial`, `anio_publicacion`, `genero`, `estado`) VALUES ('El Principito','Antoine de Saint-Exupéry','Norma','1943','Fantasía','Nuevo');

INSERT INTO `libros`(`titulo`, `autor`, `editorial`, `anio_publicacion`, `genero`, `estado`) VALUES ('1984','George Orwell','Norma','1949','Distopía','Usado');

INSERT INTO `libros`(`titulo`, `autor`, `editorial`, `anio_publicacion`, `genero`, `estado`) VALUES ('Matar a un ruiseñor','Harper Lee','Norma','1960','Drama','Nuevo');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `apellido` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(45) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `ciudad` varchar(255) NOT NULL,
  `pais` varchar(255) NOT NULL,
  `codigo_postal` varchar(45) DEFAULT NULL,
  `fecha_nto` date NOT NULL,
  `preferencias_literarias` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cajas`
--
ALTER TABLE `cajas`
  ADD PRIMARY KEY (`id_caja`);

--
-- Indices de la tabla `compra`
--
ALTER TABLE `compra`
  ADD PRIMARY KEY (`id_compra`),
  ADD KEY `fk_compra_users_idx` (`usuario_id`);

--
-- Indices de la tabla `donaciones`
--
ALTER TABLE `donaciones`
  ADD PRIMARY KEY (`id_donacion`),
  ADD KEY `fk_donaciones_users_idx` (`usuario_id`),
  ADD KEY `fk_donaciones_libros_idx` (`libro_id`);

--
-- Indices de la tabla `d_compra`
--
ALTER TABLE `d_compra`
  ADD PRIMARY KEY (`id_compra`,`linia`) USING BTREE,
  ADD KEY `id_caja` (`id_caja`);

--
-- Indices de la tabla `libros`
--
ALTER TABLE `libros`
  ADD PRIMARY KEY (`id_libro`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cajas`
--
ALTER TABLE `cajas`
  MODIFY `id_caja` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `compra`
--
ALTER TABLE `compra`
  MODIFY `id_compra` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `donaciones`
--
ALTER TABLE `donaciones`
  MODIFY `id_donacion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `libros`
--
ALTER TABLE `libros`
  MODIFY `id_libro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `compra`
--
ALTER TABLE `compra`
  ADD CONSTRAINT `fk_compra_users1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `donaciones`
--
ALTER TABLE `donaciones`
  ADD CONSTRAINT `fk_donaciones_libros1` FOREIGN KEY (`libro_id`) REFERENCES `libros` (`id_libro`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_donaciones_users1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Filtros para la tabla `d_compra`
--
ALTER TABLE `d_compra`
  ADD CONSTRAINT `d_compra_ibfk_1` FOREIGN KEY (`id_compra`) REFERENCES `compra` (`id_compra`) ON DELETE CASCADE,
  ADD CONSTRAINT `d_compra_ibfk_2` FOREIGN KEY (`id_caja`) REFERENCES `cajas` (`id_caja`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventario`
--

CREATE TABLE `inventario` (
  `id_caja` int(11) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_caja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `inventario`
--

INSERT INTO `inventario` (`id_caja`, `stock`) VALUES
(1, 100),
(2, 100),
(3, 100);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `suscriptores`
--

CREATE TABLE `suscriptores` (
  `id_suscriptor` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `nombre` VARCHAR(255),
  `fecha_suscripcion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `activo` BOOLEAN DEFAULT TRUE,
  `id_usuario` INT,
  FOREIGN KEY (`id_usuario`) REFERENCES users(`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `puntos_usuario`
--

CREATE TABLE `puntos_usuario` (
  `id_usuario` INT NOT NULL,
  `puntos` INT DEFAULT 0,
  PRIMARY KEY (`id_usuario`),
  FOREIGN KEY (`id_usuario`) REFERENCES users(`id_usuario`)
);

-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `insignias`
--

CREATE TABLE `insignias` (
  `id_insignia` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` VARCHAR(255),
  `icono` VARCHAR(255) -- ruta a la imagen o emoji
);

INSERT INTO `insignias` (`nombre`, `descripcion`, `icono`) VALUES
('Primer libro donado', '¡Bienvenido a la comunidad de donantes!', '📚'),
('Donador frecuente', 'Has donado 5 libros o más', '🏆'),
('Comprador estrella', 'Primera compra exitosa', '⭐'),
('Coleccionista', 'Has comprado 10 o más libros', '📖');
-- --------------------------------------------------------
--
-- Estructura de tabla para la tabla `insignias_usuario`
--

CREATE TABLE `insignias_usuario` (
  `id_usuario` INT NOT NULL,
  `id_insignia` INT NOT NULL,
  `fecha` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`, `id_insignia`),
  FOREIGN KEY (`id_usuario`) REFERENCES users(`id_usuario`),
  FOREIGN KEY (`id_insignia`) REFERENCES insignias(`id_insignia`)
);