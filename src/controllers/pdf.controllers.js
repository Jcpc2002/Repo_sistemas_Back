// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
import { pool } from "../db.js";
// import databaseError from "../middlewares/error.js";
// import PDFDocument from 'pdfkit';
// import crypto from 'crypto';
// import fs from 'fs';
// import path from 'path';
// import os from 'os';

export const generarInforme = async (req, res) => {
  try {
    // Consultas para obtener los datos
    const [tipoDocumentoCantidad] = await pool.query(`
      SELECT td.nombre, COUNT(d.id) AS cantidadDeProyectos
      FROM tipodocumento td
      LEFT JOIN documento d ON td.id = d.tipodocumento
      GROUP BY td.nombre
    `);

    const [totalProyectos] = await pool.query(`
      SELECT COUNT(*) AS cantidadTotalDeProyectos
      FROM documento
    `);

    const [proyectosUltimos10Dias] = await pool.query(`
      SELECT COUNT(*) AS cantidadDeProyectosEnLosUltimos10Dias
      FROM documento
      WHERE fechaSubida >= CURDATE() - INTERVAL 10 DAY
    `);

    const [totalSolicitudes] = await pool.query(`
      SELECT COUNT(*) AS cantidadDeSolicitudes
      FROM solicitud
    `);

    const [totalVistas] = await pool.query(`
      SELECT cantidadVistas FROM contadorvistas LIMIT 1
    `);

    // Devolver los datos en formato JSON
    res.status(200).json({
      tipoDocumentoCantidad,
      totalProyectos: totalProyectos[0],
      proyectosUltimos10Dias: proyectosUltimos10Dias[0],
      totalSolicitudes: totalSolicitudes[0],
      totalVistas: totalVistas[0]
    });
  } catch (error) {
    console.error('Error al generar informe:', error);
    res.status(500).json({ message: 'Error interno del servidor al realizar la consulta' });
  }
};
