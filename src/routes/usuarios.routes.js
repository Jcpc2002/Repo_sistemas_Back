import { Router } from "express";
import {postUsuarios, Postlogin,logout,editarDatos,
    editarContrasena,filtrarDocumentos
    ,filtrarDocumentosPorCategoria,filtrarDocumentoPorID,cantidadDeDocumentos,enviarSolicitud,traerSolicitudesPendientes,traerSolicitudesAceptadas,enviarCorreo, subirArchivo,rachazarSolicitud} from "../controllers/usuario.controllers.js"
import {generarInforme} from "../controllers/pdf.controllers.js"
import{categoria,editarCategoria,editarDocumento,
    eliminarDocumento,insertarDocumento,traerCategorias,
    eliminarCategoria,traerCategoriasPorId} from "../controllers/documento.controllers.js"
import {incrementarVisitas} from "../controllers/index.controller.js"
//import EnviarSolicitud from "../../../Front-soft/src/pages/EnviarSolicitud.jsx";
import authenticateToken from "../middlewares/authenticateToken.js";
const router = Router()

router.post('/login', Postlogin) //login

router.get('/logout', logout) //cerrar sesion

router.post('/usuarios',postUsuarios)//inserta un usuario administrador

router.post('/categorias',categoria )//Publica una categoria nueva

router.post('/insertarDocumento',insertarDocumento )//Publica un documento nuevo

router.get('/traerCategoria',traerCategorias )//llama a todas las categorias

router.post('/traerCategoriasPorId',traerCategoriasPorId )//llama a una categoria por id

router.get('/informe',generarInforme )//Genera un informe

router.put('/modificarDatos',editarDatos )//modifica los datos del admin

router.put('/editarContrasena',editarContrasena )//modifica la contraseña del admin

router.put('/editarDocumento',editarDocumento )//edita un documento

router.put('/editarCategoria',editarCategoria )//edita una categoria

router.delete('/eliminarDocumento',eliminarDocumento)//elimina un documento

router.post('/filtrarDocumentos',filtrarDocumentos )//filtra documentos segun la busqueda

router.post('/filtrarDocumentosPorCategoria',filtrarDocumentosPorCategoria )//filtra documentos segun la categoria

router.put('/vistas',incrementarVisitas )//incrementa las vistas

router.delete('/eliminarCategoria',eliminarCategoria)//elimina una categoria y todos los documentos asociados

router.post('/filtrarDocumentoPorID',filtrarDocumentoPorID )//filtra documento segun ID

router.get('/cantidadDeDocumentos',cantidadDeDocumentos )//cuenta la cantidad de documentos

router.post('/enviarSolicitud',enviarSolicitud)//usuario particular envia solicitudes

router.get('/traerSolicitudesPendientes',traerSolicitudesPendientes)//llama todas las solicitudes pendientes

router.get('/traerSolicitudesAceptadas',traerSolicitudesAceptadas)//llama todas las solicitudes aceptadas

router.post('/enviarCorreo',enviarCorreo)//enviar correo al usuario cuya solicitud ha sido aceptada

router.put('/subirArchivo',subirArchivo)//el usuario particular sube un archivo para revisar

router.delete('/rechazarSolicitud',rachazarSolicitud)//el admin rechaza una solicitud

router.get('/auth/check',authenticateToken, (req, res) => {
    // Si llega aquí, significa que el token es válido
    res.json({ message: "Token válido", user: req.user });
  });
export default router