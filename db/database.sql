CREATE DATABASE IF NOT EXISTS repoayd;

USE repoayd;

CREATE TABLE administrador(
    codigo INT(10) NOT NULL,
    correo varchar(255) NOT NULL,
    contrasena varchar(255) NOT NULL,
    solicitudes INT(10),
    nombre varchar(255) NOT NULL,
    fotoPerfil varchar(300),

    PRIMARY KEY(codigo)

);

CREATE TABLE solicitud(
    id INT(10) NOT NULL AUTO_INCREMENT,
    codigousuario varchar(255) NOT NULL,
    descripcion varchar(255) NOT NULL,
    estado varchar(255) NOT NULL,
    archivo varchar(300),

    PRIMARY KEY(id)

);

CREATE TABLE tipodocumento(
    id INT(10) NOT NULL AUTO_INCREMENT,
    nombre varchar(255) NOT NULL,
    descripcion varchar(255),

    PRIMARY KEY(id)

);

CREATE TABLE documento(
    id INT(10) NOT NULL AUTO_INCREMENT,
    nombre varchar(300) NOT NULL,
    tipodocumento int(10) NOT NULL,
    descripcion varchar(300) NOT NULL,
    miembros varchar(300) NOT NULL,
    archivos varchar(300) NOT NULL,
    estado INT(10) NOT NULL,
    fechaSubida Date NOT NULL,
    semestre varchar(100) NOT NULL,

    PRIMARY KEY(id)

);

CREATE TABLE contadorvistas(
    cantidadVistas INT NOT NULL DEFAULT 0,
    PRIMARY KEY (cantidadVistas)
);


-- Agregando la clave foránea para tipodocumento
ALTER TABLE documento
ADD CONSTRAINT FK_documento_tipodocumento
FOREIGN KEY (tipodocumento) REFERENCES tipodocumento(id);

--INSERT INTO `repoayd`.`administrador` (`codigo`, `correo`, `contrasena`, `nombre`) VALUES ('1152018', 'steevenandresazu@gmail.com', '123456', 'steeven sayago');
