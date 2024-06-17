import User from '../models/userModel.js';
import Preference from '../models/preferenceModel.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';

export const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Preference, as: 'Preferences' }]
    });

    if (!user) {
      return res.status(404).json({
        code: -10,
        message: 'Usuario no encontrado'
      });
    }

    const userData = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      birth_date: user.birth_date,
      city: user.city,
      country: user.country,
      email: user.email,
      profile_picture: user.profile_picture,
      preferences: user.Preferences.map(pref => pref.team_name),
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.status(200).json({
      code: 1,
      message: 'Detalle del Usuario',
      data: userData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener el usuario'
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, birth_date, city, country, preferences } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        code: -10,
        message: 'Usuario no encontrado'
      });
    }

    if (birth_date) {
      const birthDate = new Date(birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        return res.status(400).json({
          code: -20,
          message: 'Debes ser mayor de edad para actualizar la fecha de nacimiento.'
        });
      }
    }

    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.birth_date = birth_date || user.birth_date;
    user.city = city || user.city;
    user.country = country || user.country;
    await user.save();

    await Preference.destroy({ where: { user_id: user.id } });
    if (preferences && preferences.length > 0) {
      const preferenceData = preferences.map(team => ({
        user_id: user.id,
        team_name: team
      }));
      await Preference.bulkCreate(preferenceData);
    }

    res.status(200).json({
      code: 1,
      message: 'Usuario actualizado correctamente',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al actualizar el usuario'
    });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    const rutaArchivo = "./src/uploads/";

    if (req.file == undefined) {
      return res.status(400).json({
        code: -101,
        message: 'Por favor suba un archivo!'
      });
    }

    if (req.user.profile_picture) {
      fs.access(rutaArchivo + req.user.profile_picture, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(rutaArchivo + req.user.profile_picture, (err) => {
            if (err) {
              console.error('Error al eliminar el archivo', err);
              return res.status(500).json({
                code: -103,
                message: 'Error al eliminar el archivo',
                error: err
              });
            }
          });
        }
      });
    }

    req.user.profile_picture = req.file.filename;
    await req.user.save();

    res.status(200).json({
      code: 1,
      message: "Archivo subido correctamente: " + req.file.originalname,
    });
  } catch (err) {
    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "El tamaño del archivo no puede ser mayor a 2MB!",
      });
    }

    res.status(500).send({
      message: `No se pudo subir el archivo: ${req.file.originalname}. ${err}`,
      error: `${err}`
    });
  }
};