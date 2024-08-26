
import { pool } from '../db.js'


export const ping = async (req, res) => {
    const [result] = await pool.query('SELECT "pong" as result')
    res.json(result[0])
};

export const incrementarVisitas = async (req, res) => {
    try { 
        // Actualizar el valor de cantidadvisitas incrementándolo en 1
        await pool.query('UPDATE contadorvistas SET cantidadvistas = cantidadvistas + 1');

        // Obtener el valor actualizado de cantidadvisitas
        const [rows] = await pool.query('SELECT cantidadvistas FROM contadorvistas LIMIT 1');

        res.status(200).json({
            message: 'Visitas incrementadas con éxito',
            cantidadvisitas: rows[0].cantidadvistas
        });
    } catch (error) {
        console.error('Error al incrementar las visitas:', error);

        // Manejo genérico de otros errores de base de datos
        const dbError = new Error('Error interno del servidor al realizar la consulta');
        return res.status(500).json({ message: dbError.message });
    }
};