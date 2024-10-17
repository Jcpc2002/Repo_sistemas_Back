import { pool } from "../db.js";
import databaseError from "../middlewares/error.js";

export const traerCategorias = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM tipodocumento");
        res.json({ message: "Categorías encontradas", data: rows });
    } catch (error) {
        console.error("Error al traer las categorías:", error);

        // Manejo genérico de otros errores de base de datos
        const dbError = new databaseError(
            "Error interno del servidor al realizar la consulta",
            error.code || error.errno
        );
        return res.status(500).json({ message: dbError.message });
    }
};

export const insertarDocumento = async (req, res) => {
    // const connection = await pool.getConnection();

    let fechaDeHoy = new Date();
    let año = fechaDeHoy.getFullYear().toString();
    let dia = ('0' + fechaDeHoy.getDate()).slice(-2); // Agrega cero delante si es necesario
    let mes = ('0' + (fechaDeHoy.getMonth() + 1)).slice(-2); // Agrega cero delante si es necesario


    let nombre = req.body.nombre;
    let tipodocumento = req.body.tipodocumento;//el codigo del tipo de documento
    let descripcion = req.body.descripcion;
    let miembros = req.body.miembros;
    let archivos = req.body.archivos;
    let semestre = req.body.semestre;
    let estado = req.body.estado;//0 inactivo 1 activo
    let fechasubida = `${año}-${mes}-${dia}`;
    let nombreCategoria = req.body.categoriaNombre;
    console.log(req.body);
    try {
        // Consulta de actualización
        const [resultsubida] = await pool.query(
            'INSERT INTO documento (nombre,tipodocumento,descripcion,miembros,archivos,estado,fechaSubida,semestre,nombreCategoria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, tipodocumento, descripcion, miembros, archivos, estado, fechasubida, semestre, nombreCategoria]
        );



        res.status(200).json({ message: 'Documento insertado con éxito', nombre, tipodocumento, descripcion, miembros, archivos, estado, fechasubida, semestre, nombreCategoria });
    } catch (error) {
        console.error('Error al subir documento:', error);

        // Aquí capturamos el error específico de clave duplicada.
        if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
            const dbError = new Error('El código de usuario ya existe en la base de datos.');
            return res.status(409).json({ message: dbError.message });
        }

        // Manejo genérico de otros errores de base de datos
        const dbError = new Error('Error interno del servidor al realizar la consulta');
        return res.status(500).json({ message: dbError.message });
    }
};

export const editarDocumento = async (req, res) => {
    // const connection = await pool.getConnection();
    let id = req.body.id
    let nombre = req.body.nombre;
    let tipodocumento = req.body.tipodocumento;
    let descripcion = req.body.descripcion;
    let miembros = req.body.miembros;
    let semestre = req.body.semestre;
    let archivos = req.body.archivos;
    let estado = req.body.estado;
    console.log(req.body);

    if (nombre== "") {
        nombre = null;
    }
    if (tipodocumento == "") {
        tipodocumento = null;
    }
    if (descripcion == "") {
        descripcion = null;
    }
    if (miembros == "") {
        miembros = null;
    }
    if (archivos == "") {
        archivos = null;
    }
    if (estado == "") {
        estado = null;
    }
    if (semestre == "") {
        semestre = null;
    }
    try {
        // Consulta de actualización
        const [resultsubida] = await pool.query(
            'UPDATE documento SET nombre = IFNULL(?, nombre), tipodocumento = IFNULL(?, tipodocumento), descripcion = IFNULL(?, descripcion), miembros = IFNULL(?, miembros),archivos = IFNULL(?, archivos),estado = IFNULL(?, estado),semestre = IFNULL(?, semestre) WHERE id = ?',
            [nombre, tipodocumento, descripcion, miembros, archivos, estado,semestre,id]
        );


        res.status(200).json({ message: 'Actualizado con éxito', nombre, tipodocumento, descripcion, miembros, archivos, estado,semestre, id });
    } catch (error) {
        console.error('Error al actualizar los datos:', error);

        // Aquí capturamos el error específico de clave duplicada.
        if (error.code === "ER_DUP_ENTRY" || error.errno === 1062) {
            const dbError = new Error('El código de usuario ya existe en la base de datos.');
            return res.status(409).json({ message: dbError.message });
        }

        // Manejo genérico de otros errores de base de datos
        const dbError = new Error('Error interno del servidor al realizar la consulta');
        return res.status(500).json({ message: dbError.message });
    }
};

export const eliminarDocumento = async (req, res) => {
    // const connection = await pool.getConnection();
    let id = req.body.id
    console.log(req.body);
    try {
        // Consulta de actualización
        const [resultsubida] = await pool.query(
            'DELETE FROM documento WHERE id = ?',
            [id]
        );


        res.status(200).json({ message: 'Archivo eliminado con exito' });
    } catch (error) {
        console.error('Error al actualizar los datos:', error);

        // Manejo genérico de otros errores de base de datos
        const dbError = new Error('Error interno del servidor al realizar la consulta');
        return res.status(500).json({ message: dbError.message });
    }
};

export const categoria = async (req, res) => {
    try {
        const { id, nombre, descripcion } = req.body;

        // Verificar si el nombre ya existe
        const [existingRows] = await pool.query('SELECT id FROM tipodocumento WHERE nombre = ?', [nombre]);
        if (existingRows.length > 0) {
            return res.status(409).json({ message: 'El nombre de la categoria ya existe en la base de datos.' });
        }

        // Si no existe, proceder con la inserción
        const [rows] = await pool.query('INSERT INTO tipodocumento (id, nombre, descripcion) VALUES (?, ?, ?)',
            [id, nombre, descripcion]);
        res.send({
            message: "Categoria insertada",
            id: rows.insertId,
            id,
            nombre
        });
    } catch (error) {
        console.error('Error al subir categorias:', error);

        // Manejo genérico de errores de base de datos
        const dbError = new Error('Error interno del servidor al realizar la consulta');
        return res.status(500).json({ message: dbError.message });
    }
};

export const editarCategoria = async (req, res) => {
    // const connection = await pool.getConnection();
    let id = req.body.id
    let nombre = req.body.nombre;
    let descripcion = req.body.descripcion;

    console.log(req.body);

    if (nombre == "") {
        nombre = null;
      }

    if (descripcion == "") {
        descripcion = null;
    }
    try {
        // Consulta de actualización
        const [resultsubida] = await pool.query(
            'UPDATE tipodocumento SET nombre = IFNULL(?, nombre), descripcion = IFNULL(?, descripcion) WHERE id = ?',
            [nombre, descripcion, id]
        );


        res.status(200).json({ message: 'Actualizado con éxito' });
    } catch (error) {
        console.error('Error al actualizar los datos:', error);


        // Manejo genérico de otros errores de base de datos
        const dbError = new Error('Error interno del servidor al realizar la consulta');
        return res.status(500).json({ message: dbError.message });
    }
};

export const eliminarCategoria = async (req, res) => {
    const id = req.body.id;

    console.log(req.body);
    try {
        // Iniciar una transacción
        await pool.query('START TRANSACTION');

        // Eliminar los documentos asociados al tipodocumento
        await pool.query('DELETE FROM documento WHERE tipodocumento = ?', [id]);

        // Eliminar el tipodocumento
        await pool.query('DELETE FROM tipodocumento WHERE id = ?', [id]);

        // Confirmar la transacción
        await pool.query('COMMIT');

        res.status(200).json({ message: 'Eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar los datos:', error);

        // Revertir la transacción en caso de error
        await pool.query('ROLLBACK');

        // Manejo genérico de otros errores de base de datos
        const dbError = new Error('Error interno del servidor al realizar la consulta');
        return res.status(500).json({ message: dbError.message });
    }
};

export const traerCategoriasPorId = async (req, res) => {
    const id = req.body.id;

    console.log(req.body);
    try {
        const [rows] = await pool.query("SELECT * FROM tipodocumento WHERE id = ?",[id]);
        res.json({ message: "Categoría encontrada", data: rows });
    } catch (error) {
        console.error("Error al traer la categoría:", error);

        // Manejo genérico de otros errores de base de datos
        const dbError = new databaseError(
            "Error interno del servidor al realizar la consulta",
            error.code || error.errno
        );
        return res.status(500).json({ message: dbError.message });
    }
};