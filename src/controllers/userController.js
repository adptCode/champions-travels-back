import User from '../models/userModel.js';
import Preference from '../models/preferenceModel.js';
import EventParticipation from '../models/participationModel.js';
import Event from '../models/eventModel.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig.js";
import { processAndUploadFile, deleteFile } from "../middlewares/uploadMiddleware.js";

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
      profile_picture: user.profile_picture ?  `${req.protocol}://${req.get('host')}/uploads/${user.profile_picture}` : null,
      preferences: user.Preferences.map(pref => pref.team_name),
      role: user.role,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
    console.log(userData.profile_picture)

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

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
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
      profile_picture: user.profile_picture ? `${req.protocol}://${req.get('host')}/uploads/${user.profile_picture}` : null,
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

export const getUserEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const participations = await EventParticipation.findAll({
      where: { user_id: id },
      include: [{ model: Event }]
    });

    if (!participations) {
      return res.status(404).json({
        code: -10,
        message: 'Eventos no encontrados para el usuario'
      });
    }

    const events = participations.map(participation => participation.Event);

    res.status(200).json({
      code: 1,
      message: 'Lista de eventos del usuario',
      data: events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener los eventos del usuario'
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
      let age = today.getFullYear() - birthDate.getFullYear();
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
    console.log("Iniciando carga de foto...");

    if (!req.file) {
      return res.status(400).json({ code: -1, message: "No se recibió ningún archivo" });
    }

    console.log("Archivo recibido:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ code: -1, message: "Usuario no encontrado" });
    }

    if (user.profile_picture) {
      await deleteFile(user.profile_picture); // Eliminar foto anterior si existe
    }

    const fileUrl = await processAndUploadFile(req.file, "profile_pictures");
    user.profile_picture = fileUrl;
    await user.save();

    res.status(200).json({ code: 1, message: "Foto cargada correctamente", data: { profile_picture: fileUrl } });
  } catch (error) {
    console.error("Error al cargar la foto:", error);
    res.status(500).json({ code: -100, message: "Error al cargar la foto", error: error.message });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user || !user.profile_picture) {
      return res.status(400).json({
        code: -104,
        message: "No hay foto para eliminar",
      });
    }

    if (isProduction) {
      // Produzione: Eliminazione da Firebase Storage
      const storageRef = ref(storage, user.profile_picture);

      try {
        await storageRef.delete();
        console.log("Foto eliminata da Firebase Storage.");
      } catch (err) {
        console.error("Errore al eliminare la foto da Firebase:", err);
        return res.status(500).json({
          code: -103,
          message: "Error al eliminar la foto en Firebase",
          error: err,
        });
      }

      user.profile_picture = null;
    } else {
      // Sviluppo: Eliminazione locale
      const rutaArchivo = "./src/uploads/";
      const filePath = path.join(rutaArchivo, user.profile_picture);

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error("Error al acceder al archivo", err);
          return res.status(500).json({
            code: -103,
            message: "Error al acceder al archivo",
            error: err,
          });
        }

        fs.unlink(filePath, async (err) => {
          if (err) {
            console.error("Error al eliminar el archivo", err);
            return res.status(500).json({
              code: -103,
              message: "Error al eliminar el archivo",
              error: err,
            });
          }

          user.profile_picture = null;
          await user.save();

          res.status(200).json({
            code: 1,
            message: "Foto eliminada correctamente",
          });
        });
      });
    }

    await user.save();

    res.status(200).json({
      code: 1,
      message: "Foto eliminada correctamente",
    });
  } catch (err) {
    res.status(500).send({
      message: `No se pudo eliminar la foto. ${err}`,
      error: `${err}`,
    });
  }
};


export const addPreference = async (req, res) => {
  try {
    const { team_name } = req.body;
    const userId = req.user.id;

    if (!team_name) {
      return res.status(400).json({
        code: -1,
        message: 'Team name is required'
      });
    }

    const preference = await Preference.create({ user_id: userId, team_name });
    res.status(201).json({
      code: 1,
      message: 'Preference added successfully',
      data: preference
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'An error occurred while adding preference'
    });
  }
};

export const removePreference = async (req, res) => {
  try {
    const { team_name } = req.body;
    const userId = req.user.id;

    const preference = await Preference.findOne({ where: { user_id: userId, team_name } });

    if (!preference) {
      return res.status(404).json({
        code: -1,
        message: 'Preference not found'
      });
    }

    await preference.destroy();
    res.status(200).json({
      code: 1,
      message: 'Preference removed successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'An error occurred while removing preference'
    });
  }
};

export const removeUserFromEvent = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const participation = await EventParticipation.findOne({ where: { user_id: userId, event_id: eventId } });

    if (!participation) {
      return res.status(404).json({
        code: -1,
        message: 'Participation not found'
      });
    }

    await participation.destroy();

    res.status(200).json({
      code: 1,
      message: 'User removed from event successfully'
    });
  } catch (error) {
    console.error('Error removing user from event:', error);
    res.status(500).json({
      code: -100,
      message: 'An error occurred while removing the user from the event',
      error: error.message
    });
  }
};