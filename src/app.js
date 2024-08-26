import express from 'express';
import usuariosRutas from './routes/usuarios.routes.js'
import indexRoutes from './routes/index.routes.js'
import cors from 'cors'

const app = express()



app.use(express.json())
app.use(cors());

app.use(indexRoutes)
app.use(usuariosRutas)

app.use(cors({
    origin: 'http://localhost:5173' // Solo permite solicitudes de este origen
  }));

app.use((req, res ,next)=>{
    res.status(400).json({
        message: 'endpoint no encontrado'
    })
})

export default app;