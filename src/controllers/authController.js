import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import RecoveryToken from '../models/recoveryTokenModel.js';
import sendEmail from "../utils/email/sendEmail.js";
import { validationResult } from 'express-validator';
import { serialize } from 'cookie';
// Creación de funciones personalizadas
import { esPar, contraseniasCoinciden } from '../utils/utils.js';

const clientURL = process.env.CLIENT_URL;

export const register = async (req, res) => {
  
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.error("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { email, password, first_name, last_name, birth_date } = req.body;  
      
    const existingUser = await User.findOne({ where: { email }});
    if (existingUser) {
      return res.status(400).json({
        errors: [
          { path: 'email', code: -2, msg: 'Email already exists' }
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
    const newUser = new User({ email, password: hashedPassword, first_name, last_name, birth_date, status: 1 });
    await newUser.save();

    const accessToken = jwt.sign({ id: newUser.id, role: newUser.role }, process.env.JWT_SECRET);
    const token = serialize('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    res.setHeader('Set-Cookie', token);

    res.status(200).json({
      code: 1,
      message: 'Usuario registrado correctamente',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al registrar el usuario',
      error: error,
    });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        code: -25,
        message: 'user does not exist'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        code: -5,
        message: 'Invalid credentials'
      });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    const token = serialize('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    res.setHeader('Set-Cookie', token);

    res.status(200).json({
      code: 1,
      message: 'Login OK',
      data: {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role
        } 
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'An error occurred during login',
      error: error
    });
  }
};

export const logout = async (req, res) => {
  const token = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: -1,
    path: '/',
  });
  res.setHeader('Set-Cookie', token);
  res.status(200).json({
    code: 0,
    message: 'Logged out - Delete Token',
  });
};


export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);

    // If there are validation errors, respond with a 400 Bad Request status
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        code: -8,
        message: 'Email does not exist'
      });
    }

    let resetToken = crypto.randomBytes(32).toString("hex");

    await new RecoveryToken({
      user_id: user.id,
      token: resetToken,
      created_at: Date.now(),
    }).save();

    const link = `${clientURL}/change-password?token=${resetToken}&id=${user.id}`;

    await sendEmail(
      user.email,
      "Password Reset Request",
      {
        first_name: user.first_name,
        link: link,
      },
      "email/template/requestResetPassword.handlebars"
    ).then(response => {
      console.log("Resultado del envío del correo:", response);
      res.status(200).json({
        code: 100,
        message: 'Send Email OK',
        data: {
          token: resetToken,
          link: link
        }
      });

    },error => {
      console.error (error)
      res.status(200).json({
        code: -80,
        message: 'Send Email KO',
        data: {error}
      });
    })

  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al actualizar el usuario',
      error: error
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);

    // If there are validation errors, respond with a 400 Bad Request status
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    //Reviso si el Token existe
    let token_row = await RecoveryToken.findOne({ where: { token } });
    if (!token_row) {
      return res.status(404).json({
        code: -3,
        message: 'Token Incorrecto'
      });
    } 

    // Buscar un usuario por su ID en la base de datos
    const user = await User.findOne({ where: { id: token_row.user.id } });
    if (!user) {
      return res.status(404).json({
        code: -10,
        message: 'Usuario no encontrado'
      });
    }


    // Actualizar la contraseña del usuario
    user.password = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT));
    await user.save();
    //Elimino el token
    await RecoveryToken.destroy({
      where: {
        id: token_row.user.id
      }
    })

    // Generar un token de acceso y lo guardo en un token seguro (httpOnly)
    const accessToken = jwt.sign({ id: user.id, first_name: user.first_name }, process.env.JWT_SECRET);
    const token_jwt = serialize('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });
    res.setHeader('Set-Cookie', token_jwt);

    // Enviar una respuesta al cliente
    res.status(200).json({
      code: 1,
      message: 'User Detail',
      data: {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        } 
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al actualizar el usuario',
      error: error
    });
  }
};
