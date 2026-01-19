-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 16-01-2026 a las 17:47:15
-- Versión del servidor: 8.4.3
-- Versión de PHP: 8.3.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gestion_microempresas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `estado` enum('activo','inactivo') DEFAULT 'activo',
  `microempresa_id` int DEFAULT NULL,
  `rol_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre`, `apellido`, `email`, `password`, `fecha_creacion`, `estado`, `microempresa_id`, `rol_id`) VALUES
(24, 'as', 'as', 'jhonnyarias259@gmail.com', '$2b$10$3s2ZlcfHBfT8uw1RLH/GdeConHCYDdGzQN78.r7MveQsuW0eM1i9C', '2026-01-16 03:48:36', 'activo', 1, 3),
(26, 'joel', 'qw', 'joeldeybidnogalesnitales@gmail.com', '$2b$10$9VmRycktCqo.oUY7pLWThuMZxpYBie7wKcucaQO2ocjmm/7b0/Tue', '2026-01-16 04:03:53', 'activo', NULL, 1),
(27, 'prueba ', 'asd', 'jonasariasv@gmail.com', '$2b$10$IEiAlUbCgk0uKbxDD9E0VOOnGtoAwJ4caS4ScUHuh0Ne19jOqDtlC', '2026-01-16 04:09:58', 'activo', NULL, 2),
(28, 'qwe', 'qwe', 'qwe@qwe', '$2b$10$I5wtodOljGyTlu46sVrTTur0v16D0NDmoNOMQj1Tuo9Rbo1o0QrE2', '2026-01-16 04:52:55', 'activo', NULL, 2),
(30, 'qw', 'qw', 'qw@qw', '$2b$10$bmOPoi0eXbN7RETKR6oq6..7b7gHlinohjNNJMoYacvsrJGGK8X52', '2026-01-16 05:32:07', 'activo', NULL, NULL),
(31, '12', '12', '12@12', '$2b$10$VpGdE8EIKFqkEVwaOlAmVuLi6yVs3TIH1krNeM/eSI3ydQjNsvu46', '2026-01-16 05:33:53', 'activo', 3, 2),
(32, 'qwqw', 'qw', 'qwq@wqw', '$2b$10$7RT94YpeHbYMNAQVKVNqGelBZZAGrIWHmwytgiH16dfhKgrfo9c5q', '2026-01-16 06:13:30', 'activo', NULL, 2),
(33, 'asd', 'asd', 'asd@asd', '$2b$10$mBVZzjjLRZrdpGiqNKH2deXMeOmgR1seD1w/KtVBUSMKrJNM/EU9i', '2026-01-16 06:21:45', 'activo', NULL, 2),
(34, 'rr1', 'rr', 'qqw@qwq', '$2b$10$bKAAuYzLKDMWsEhK6qhSyec8bXHEie0cs/8A2XaHR1z30UwPIFNLa', '2026-01-16 06:32:27', 'activo', NULL, 2),
(37, 'aa', 'aa', 'aa@qw', '$2b$10$OFXND7afmzjcOaZ0lac7SONpLb6sKc7SbYavFSmyqV73p2t/SCwku', '2026-01-16 06:43:58', 'activo', NULL, 2),
(38, 'asd', 'asdasd', 'ppq@pp', '$2b$10$XaBX6SRhtjXxkRqF0fStiuV2BaaRiObTPoPvFXB5Yx94LtbxNKwZ6', '2026-01-16 06:57:06', 'activo', NULL, 2),
(39, 'appo', 'aas', 'a@a', '$2b$10$16rWPO4f0Y.TqypNtvEVRup4qH6pPi.0O/AdyU5/6g.g1Tp2IRJVu', '2026-01-16 07:01:20', 'activo', NULL, 2),
(40, 'asd', 'as', 'a1@a1', '$2b$10$Ynq66pkD/nBNrOPrMPu6iOfnC6b46.Jsr1PJqt7EDWOUpHtYv3Lz6', '2026-01-16 07:52:27', 'activo', 9, 2),
(41, 'vv', 'vv', 'vv@vv', '$2b$10$QRQvF1gBaKmXKsv5V3DmWeLErWRwMRhlZhxlkWjZqQUVWc0poAgx6', '2026-01-16 08:09:11', 'activo', 12, 2),
(42, 'ax', 'xa', 'xa@xa', '$2b$10$IPUIorVK3IAtlY0RSanjROHfAaV05wtkB6F4MK1kPkBitQyJWc/GO', '2026-01-16 11:15:05', 'activo', 14, 2),
(43, 'cc', 'ccc', 'cc@cc', '$2b$10$GDnOL8OhWm3toqGBRHp.NOX96G.JhkG/AB8NkWGS3mtP/MVu35aDG', '2026-01-16 11:53:06', 'activo', 14, 2),
(44, 'xx', 'xx', 'xx@xx', '$2b$10$dPyNBDY6z8N4/MEX8k04QucV8pLzhfWllp3lgdZ1rZ8jcsSliGbt6', '2026-01-16 12:37:52', 'activo', NULL, 2),
(46, 'zz', 'zz', 'zz@zz', '$2b$10$gYgFFXm19PRzH/cBt21ZTObIVwRKECpLDm5Yof7wPtXzwOYBJzW/2', '2026-01-16 12:59:47', 'activo', NULL, 2),
(47, 'dd', 'dd', 'dd@dd', '$2b$10$CAhkz46MQC0ln4EJIZZi4uQ4o8qwG4vXlLQrrLUW8RlIuXLb9qLFm', '2026-01-16 13:08:46', 'activo', NULL, 2),
(48, 'ccqw', 'ccqw', 'ii@ii', '$2b$10$6HrsHPMGLvDPAaiJVlUoR.yANYv6nk/rfj6HPS18DLBXhuNJ/YiwO', '2026-01-16 13:13:57', 'activo', NULL, 2),
(49, 'uu', 'uu', 'uu@uu', '$2b$10$SCQ9sk0j/W8SqDcZ8PkeHeWeEKMEI7AK5YfAJxgUOXWRlQGPQDnTi', '2026-01-16 13:19:53', 'activo', NULL, 2),
(50, 'kevin', 'lolo', 'ke@gmail.com', '$2b$10$POPqvVnJwsI7IiXO4T3ZAOId4WW94IgiYFWEH6OJAK0v2oc99vQ2a', '2026-01-16 14:35:49', 'activo', NULL, 2),
(51, '12', '12', '12@w', '$2b$10$BiBoHwg6l5x3FTEpCtCFK.IucpXzWicUjsif7znof5otwC7tF50z.', '2026-01-16 14:39:47', 'activo', NULL, 2),
(52, 'cv', 'cv', 'cv@cv', '$2b$10$FTaGjll9y7V9bG2R6Z.Ws./R1XuxihCq.Ut5JLp4gmq.Uei2vmF/.', '2026-01-16 14:42:25', 'activo', NULL, 2),
(54, 'qq', 'qq', 'qq@qq', '$2b$10$fRUDurYxKfqzO0o38vgfOueQtNG62biQnzuTZ9YJUHcld4rHLREEu', '2026-01-16 15:09:26', 'activo', NULL, 2),
(55, 'Carlos', 'Dueño', 'carlos@empresa.com', '$2b$10$Iucp53TGYvC2HQkM.W7Uo.tXc.YOjxiBPjVtnzxPt6QojBjEi.Ofq', '2026-01-16 15:11:40', 'activo', NULL, 2),
(56, 'Carslos', 'Duesño', 'carlsos@empsresa.com', '$2b$10$t5YQOkcjhmRCp3hH02d0huDxvZ4sA5zX2YFvPRREsgYiSQEWxEF7K', '2026-01-16 15:14:03', 'activo', NULL, 2),
(57, 'zz', 'zzx', 'cx@cx', '$2b$10$4AAe/b7SsIkL.kugNmkLWeszgdMBOX0ITEjVw2YmUgtfZDt4S4cf2', '2026-01-16 15:23:32', 'activo', NULL, 2),
(58, '123', 'wer', 'g@g', '$2b$10$rL4gIGCJoqwUCByO4WLHBulRsIYp5.oUaMec7Tt7kPGebFZZP.fOK', '2026-01-16 15:40:45', 'activo', NULL, 3),
(59, 'Carlos', 'Dueño', 'dueño1@gmail.com', '$2b$10$MKxwBZjWMbW3z..DG/CyVOSH7ljItj1XdCaX95huBUpDEh.tBpICm', '2026-01-16 15:44:13', 'activo', NULL, 2),
(60, 'ff', 'ff', 'ff@ww', '$2b$10$k697kUNOwHEmr88fTMs2hujRJfn5yTL/08GZRY2vY5MeM1D46iESC', '2026-01-16 15:46:25', 'activo', NULL, 2),
(61, 'ttt', 'tttt', 'tt@tt', '$2b$10$rXJjOpUW0sSH.sgVnzM8RONjkctAmBc/OQtONCW0XQ.KOyjg4LiwK', '2026-01-16 16:04:27', 'activo', NULL, 2),
(62, 'eqw', 'qwe', 'qwe1@qwe', '$2b$10$.prA.lHvFQypHuIMjEElx.p1tNEGUJi2hN7O50PeKVC8YwKho4O2O', '2026-01-16 16:23:52', 'activo', NULL, 2),
(63, 'Maria', 'Gomez', 'maria.gomez@test.com', '$2b$10$JUxmFGbGj4v6NsW6O/eRnODhrFwtuxoShtEd81m51iHUwbWA4y1HK', '2026-01-16 16:39:32', 'activo', NULL, 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `microempresa_id` (`microempresa_id`),
  ADD KEY `rol_id` (`rol_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`microempresa_id`) REFERENCES `microempresa` (`id_microempresa`),
  ADD CONSTRAINT `usuario_ibfk_2` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
