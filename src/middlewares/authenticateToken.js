// src/middlewares/authenticateToken.js
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const authenticateToken = (allowedRoles) => async (req, res, next) => {
  try {
    const { cookies } = req;
    const accessToken = cookies.token;

    if (!accessToken) {
      console.log("No access token provided");
      return res.status(401).json({
        code: -50,
        message: 'No se ha proporcionado un token de acceso'
      });
    }

    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findByPk(decodedToken.id);
    if (!user) {
      console.log("Invalid access token");
      return res.status(401).json({
        code: -70,
        message: 'Token de acceso no válido'
      });
    }

    const hasPermission = allowedRoles.includes(user.role);
    if (!hasPermission) {
      console.log("No permission");
      return res.status(403).json({
        code: -10,
        message: 'No tiene los permisos necesarios.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al autenticar el token de acceso'
    });
  }
};