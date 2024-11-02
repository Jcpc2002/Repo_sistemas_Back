import express from 'express';
import usuariosRutas from './routes/usuarios.routes.js'
import indexRoutes from './routes/index.routes.js'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express()
app.use(cookieParser());


app.use(express.json())

app.use(cors({
    origin: ['https://repositoriosistemas.netlify.app', 'http://localhost:5173'], // Solo permite solicitudes de este origen
    credentials: true // Habilita el envío de cookies desde el frontend
}));

app.use(indexRoutes)
app.use(usuariosRutas)


app.use((req, res, next) => {
    res.status(400).json({
        message: 'endpoint no encontrado'
    });
});

export default app;