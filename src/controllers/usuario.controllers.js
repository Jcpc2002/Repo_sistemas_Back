import { pool } from "../db.js";
import databaseError from "../middlewares/error.js";
import nodemailer from "nodemailer";
import { SECRET_KEY } from "../config.js";
import jwt from "jsonwebtoken";

//Login
export const Postlogin = async (req, res) => {
  const connection = await pool.getConnection();

  let autenticado = false;
  let codigo;
  let correo;
  let nombre;
  let fotoPerfil;
  console.log(req.body);
  try {
    const code = req.body.codigo;
    const user = req.body.correo;
    const pass = req.body.contrasena;

    const results = await connection.query(
      "SELECT * FROM administrador WHERE codigo = ? AND correo = ? AND contrasena = ?",
      [code, user, pass]
    );
    console.log(results[0][0]);
    if (results[0].length >= 1) {
      // El usuario se autenticó correctamente
      autenticado = true;
      nombre = results[0][0].nombre;
      correo = results[0][0].correo;
      codigo = results[0][0].codigo;
      fotoPerfil = results[0][0].fotoPerfil;
      console.log("Autenticación exitosa");
      //borrable a futuro el isadmin
      const token = jwt.sign({ nombre, correo }, SECRET_KEY, {
        expiresIn: "1h",
      });
      res
        .cookie("access_token", token, {
          secure: true, // Necesario para HTTPS
          sameSite: "none", // Necesario para permitir cookies en diferentes dominios
          httpOnly: true,
        })
        .status(200)
        .json({
          message: "loggeado con éxito",
          autenticado: autenticado,
          nombre: nombre,
          correo: correo,
          codigo: codigo,
          fotoPerfil: fotoPerfil,
          token,
        });
    } else {
      // Las credenciales son incorrectas
      console.log("Credenciales incorrectas");
      res.status(401).json({
        message: "Credenciales incorrectas",
        autenticado: autenticado,
      });
    }
  } catch (error) {
    console.error("Error de consulta:", error);

    const dbError = new databaseError(
      "Error interno del servidor al realizar la consulta",
      error.code || error.errno
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const logout = async (req, res) => {
  res
    .clearCookie("access_token", {
      secure: true,   
      sameSite: "none",
      httpOnly: true, 
    })
    .status(200)
    .json({ message: "Se cerró la sesión" });
};
//Insertar usuario administrador
export const postUsuarios = async (req, res) => {
  try {
    const { codigo, correo, nombre } = req.body;
    const [rows] = await pool.query(
      "INSERT INTO administrador (codigo,correo,contrasena,nombre) VALUES (?,?,?,?)",
      [codigo, correo, codigo, nombre]
    );
    res.send(
      "Usuario insertado" +
        {
          id: rows.insertId,
          nombre,
          codigo,
        }
    );
  } catch (error) {
    console.error("Error al subir usuarios:", error);

    // Aquí capturamos el error específico de clave duplicada.
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      const dbError = new databaseError(
        "El código de usuario ya existe en la base de datos.",
        error.code || error.errno
      );
      return res.status(409).json({ message: dbError.message });
    }

    // Manejo genérico de otros errores de base de datos
    const dbError = new databaseError(
      "Error interno del servidor al realizar la consulta",
      error.code || error.errno
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const editarDatos = async (req, res) => {
  const codigo = req.body.codigo;
  let correo = req.body.correo;
  let fotoPerfil = req.body.fotoPerfil;
  let nombre = req.body.nombre;
  console.log(req.body);
  if (fotoPerfil == "") {
    fotoPerfil = null;
  }
  if (nombre == "") {
    nombre = null;
  }
  if (correo == "") {
    correo = null;
  }
  try {
    // Consulta de actualización
    const [updateResult] = await pool.query(
      "UPDATE administrador SET nombre = IFNULL(?, nombre), correo = IFNULL(?, correo), fotoPerfil = IFNULL(?, fotoPerfil) WHERE codigo = ?",
      [nombre, correo, fotoPerfil, codigo]
    );

    // Consulta para obtener los datos actualizados
    const [datos] = await pool.query(
      "SELECT * FROM administrador WHERE codigo = ?",
      [codigo]
    );

    if (datos.length >= 1) {
      // Datos nuevos que actualiza el usuario
      nombre = datos[0].nombre;
      correo = datos[0].correo;
      fotoPerfil = datos[0].fotoPerfil;
    }

    res
      .status(200)
      .json({ message: "Actualizado con éxito", nombre, correo, fotoPerfil });
  } catch (error) {
    console.error("Error al actualizar los datos:", error);

    // Aquí capturamos el error específico de clave duplicada.
    if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
      const dbError = new Error(
        "El código de usuario ya existe en la base de datos."
      );
      return res.status(409).json({ message: dbError.message });
    }

    // Manejo genérico de otros errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const editarContrasena = async (req, res) => {
  const { contrasena, codigo } = req.body;

  console.log(req.body);
  try {
    // Verificar si el código existe
    const [rows] = await pool.query(
      "SELECT * FROM administrador WHERE codigo = ?",
      [codigo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Código incorrecto" });
    }

    // Consulta de actualización
    await pool.query(
      "UPDATE administrador SET contrasena = IFNULL(?, contrasena) WHERE codigo = ?",
      [contrasena, codigo]
    );

    res.status(200).json({ rta: "Contraseña actualizada" });
  } catch (error) {
    console.error("Error al actualizar los datos:", error);

    // Manejo genérico de otros errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const filtrarDocumentos = async (req, res) => {
  const dato = req.body.dato;

  console.log(req.body);

  try {
    // Consulta para buscar el dato en múltiples campos
    const [result] = await pool.query(
      `SELECT * FROM documento 
       WHERE descripcion LIKE ? 
          OR semestre LIKE ? 
          OR nombre LIKE ? 
          OR tipodocumento LIKE ?`,
      [`%${dato}%`, `%${dato}%`, `%${dato}%`, `%${dato}%`]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No se encontró nada por esta búsqueda",
      });
    }

    res.status(200).json({
      message: "Documentos encontrados",
      documentos: result,
    });
  } catch (error) {
    console.error("Error al buscar los documentos:", error);

    // Manejo genérico de otros errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const filtrarDocumentosPorCategoria = async (req, res) => {
  const id = req.body.id;

  console.log(req.body);

  try {
    // Consulta para buscar el dato en múltiples campos
    const [result] = await pool.query(
      `SELECT * FROM documento 
       WHERE tipoDocumento = ?`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No se encontró nada por esta búsqueda",
      });
    }

    res.status(200).json({
      message: "Documentos encontrados",
      documentos: result,
    });
  } catch (error) {
    console.error("Error al buscar los documentos:", error);

    // Manejo genérico de otros errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const filtrarDocumentoPorID = async (req, res) => {
  const id = req.body.id;

  console.log(req.body);

  try {
    // Consulta para buscar el dato en múltiples campos
    const [result] = await pool.query(
      `SELECT * FROM documento 
       WHERE id = ?`,
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No se encontró nada por esta búsqueda",
      });
    }

    res.status(200).json({
      message: "Documentos encontrados",
      documentos: result,
    });
  } catch (error) {
    console.error("Error al buscar los documentos:", error);

    // Manejo genérico de otros errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const cantidadDeDocumentos = async (req, res) => {
  try {
    // Consulta para buscar el dato en múltiples campos
    console.log("Ejecutando consulta de cantidad total de proyectos...");
    const [totalProyectos] = await pool.query(`
    SELECT COUNT(*) AS cantidadTotalDeProyectos
    FROM documento
  `);

    if (totalProyectos.length === 0) {
      return res.status(404).json({
        message: "No se encontró nada por esta búsqueda",
      });
    }

    res.status(200).json({
      message: "cantidad encontrada",
      documentos: totalProyectos[0].cantidadTotalDeProyectos,
    });
  } catch (error) {
    console.error("Error al buscar los documentos:", error);

    // Manejo genérico de otros errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const enviarSolicitud = async (req, res) => {
  try {
    const { nombre, codigousuario, correo, descripcion, nombreProyecto } = req.body;
    const estado = 0;
    // Verificar si el usuario ya envio una solicitud
    const [existingRows] = await pool.query(
      "SELECT id FROM solicitud WHERE codigousuario = ?",
      [codigousuario]
    );
    if (existingRows.length > 0) {
      return res
        .status(409)
        .json({ message: "El usuario ya envio una solicitud." });
    }

    // Si no existe, proceder con la inserción
    const [rows] = await pool.query(
      "INSERT INTO solicitud (nombre, codigousuario, descripcion,estado, correo, nombreproyecto) VALUES (?, ?, ?, ?, ?, ?)",
      [nombre, codigousuario, descripcion, estado, correo, nombreProyecto]
    );

    res.status(200).json({ message: "Solicitud enviada" });
  } catch (error) {
    console.error("Error al enviar solicitud:", error);

    // Manejo genérico de errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const traerSolicitudesPendientes = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM solicitud WHERE estado = 0");
    res.json({ message: "Solicitudes encontradas", data: rows });
  } catch (error) {
    console.error("Error al traer las solicitudes:", error);

    // Manejo genérico de otros errores de base de datos
    const dbError = new databaseError(
      "Error interno del servidor al realizar la consulta",
      error.code || error.errno
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const traerSolicitudesAceptadas = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM solicitud WHERE estado = 1");
    res.json({ message: "Solicitudes encontradas", data: rows });
  } catch (error) {
    console.error("Error al traer las solicitudes:", error);

    // Manejo genérico de otros errores de base de datos
    const dbError = new databaseError(
      "Error interno del servidor al realizar la consulta",
      error.code || error.errno
    );
    return res.status(500).json({ message: dbError.message });
  }
};

export const enviarCorreo = async (req, res) => {
  const { correo, codigo, nombre } = req.body;
  // Configura el transporte de correo
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "repositorioayd@gmail.com",
      pass: "crok zxgf ychi cxtj",
    },
  });

  const mailOptions = {
    from: "repositorioayd@gmail.com",
    to: correo,
    subject: "Solicitud Aceptada",
    text: "Tu solicitud ha sido aceptada. Envia tu archivo a traves de este link: https://repositoriosistemas.netlify.app/enviar.",
  };

  const [resultsubida] = await pool.query(
    "UPDATE solicitud SET estado = 1 WHERE codigousuario = ?",
    [codigo]
  );

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado exitosamente" });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo" });
  }
};

export const subirArchivo = async (req, res) => {
  const { codigo, archivo } = req.body;

  const [rows] = await pool.query(
    "SELECT * FROM solicitud WHERE codigousuario = ?",
    [codigo]
  );

  if (rows.length === 0) {
    return res
      .status(404)
      .json({ message: "El código no esta en la base de datos" });
  }

  const [resultsubida] = await pool.query(
    "UPDATE solicitud SET archivo = ? WHERE codigousuario = ?",
    [archivo, codigo]
  );

  res.status(200).json({ message: "Archivo subido con éxito" });
};

export const rachazarSolicitud = async (req, res) => {
  const { codigousuario } = req.body;
  console.log(codigousuario);
  try {
    await pool.query("DELETE FROM solicitud WHERE codigousuario = ?", [
      codigousuario,
    ]);

    res.status(200).json({ message: "Eliminado con éxito" });
  } catch (error) {
    console.error("Error al eliminar los datos:", error);

    // Revertir la transacción en caso de error
    await pool.query("ROLLBACK");

    // Manejo genérico de otros errores de base de datos
    const dbError = new Error(
      "Error interno del servidor al realizar la consulta"
    );
    return res.status(500).json({ message: dbError.message });
  }
};
