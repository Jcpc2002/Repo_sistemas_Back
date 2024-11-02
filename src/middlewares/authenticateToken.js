import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../config.js";

const authenticateToken = (req, res, next) => {
    console.log(req.cookies)
  const token = req.cookies.access_token; // Obtén el token de la cookie
    
  if (!token) {
    console.log(token)
    return res.status(401).json({ message: "No autenticado" });
  }

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