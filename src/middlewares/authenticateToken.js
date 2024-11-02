import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";

const authenticateToken = (req, res, next) => {
    console.log("Cookies:", req.cookies); // Añade esta línea para depurar
    const token = req.cookies.access_token; // Obtén el token de la cookie
  
   
  
    // Verifica el token
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token no válido" });
      }
      req.user = user; // Añade la información del usuario a la request
      next(); // Continúa hacia la ruta protegida
    });
  };

export default authenticateToken;