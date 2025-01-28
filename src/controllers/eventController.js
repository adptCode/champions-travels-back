import Event from '../models/eventModel.js';
import EventParticipation from '../models/participationModel.js';
import User from '../models/userModel.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { ref, getDownloadURL } from "firebase/storage";
// import { storage } from "../firebaseConfig.js";
// import { processAndUploadFile, deleteFile } from "../middlewares/uploadMiddleware.js";
import { processAndUploadFile, deleteFile } from "../middlewares/firebaseAdminUpload.js";
import { generateSignedUrl } from '../middlewares/firebaseAdminUpload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll();

    const eventsWithPhotoUrls = await Promise.all(
      events.map(async (event) => {
        let photoUrl = null;
        if (event.photo) {
          // const storageRef = ref(storage, event.photo);
          try {
            // photoUrl = await getDownloadURL(storageRef);
            photoUrl = await generateSignedUrl(event.photo)
          } catch (error) {
            if (error.code === 'storage/object-not-found') {
              console.warn(`File not found: ${event.photo}`);
              // Imposta photoUrl a null o a un'immagine di default
              photoUrl = null; // O assegnare una URL di default
            } else {
              throw error; // Rilancia l'errore se è di altro tipo
            }
          }
        }
        return {
          ...event.toJSON(),
          photo: photoUrl,
        };
      })
    );

    res.status(200).json({
      code: 1,
      message: 'Lista degli Eventi',
      data: eventsWithPhotoUrls,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Errore durante il recupero degli eventi',
    });
  }
};


export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ code: -6, message: 'Evento non trovato' });
    }

    let photoUrl = null;
    if (event.photo) {
      // const storageRef = ref(storage, event.photo);
      try {
        // photoUrl = await getDownloadURL(storageRef);
        photoUrl = await generateSignedUrl(event.photo)
      } catch (error) {
        if (error.code === 'storage/object-not-found') {
          console.warn(`File not found: ${event.photo}`);
          photoUrl = null;
        } else {
          throw error;
        }
      }
    }

    res.status(200).json({
      code: 1,
      message: 'Dettagli dell\'Evento',
      data: { ...event.toJSON(), photo: photoUrl }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Errore durante il recupero dell\'evento',
      error: error.message
    });
  }
};

export const addEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, event_date, location, start_time, end_time  } = req.body;
    /**/ const eventPhoto = req.file ? req.file.filename : null;
    const newEvent = await Event.create({ title, description, event_date, location, start_time, end_time, photo: eventPhoto });

    res.status(200).json({
      code: 1,
      message: 'Evento añadido correctamente',
      data: newEvent
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al añadir el evento'
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_date, location, start_time, end_time  } = req.body;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        code: -6,
        message: 'Evento no encontrado'
      });
    }

    
    if (req.file) {
      if (event.photo) {
        const oldPath = path.join(rutaArchivo, event.photo);
        fs.unlink(oldPath, (err) => {
          if (err) console.error(err);
        });
      }
      event.photo = req.file.filename;
    }

   

    event.title = title;
    event.description = description;
    event.event_date = event_date;
    event.location = location;
    event.start_time = start_time;
    event.end_time = end_time;
    await event.save();

    res.status(200).json({
      code: 1,
      message: 'Evento actualizado correctamente',
      data: event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al actualizar el evento'
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        code: -100,
        message: 'Evento no encontrado'
      });
    }

    // Se l'evento ha una foto associata, eliminiamola
    if (event.photo) {
      const oldPath = path.join(rutaArchivo, event.photo);
      fs.unlink(oldPath, (err) => {
        if (err) console.error(err);
      });
    }

    // Eliminare l'evento dal database
    await Event.destroy({ where: { id } });

    res.status(200).json({
      code: 1,
      message: 'Evento eliminado correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al eliminar el evento'
    });
  }
};

export const participateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        code: -6,
        message: 'Evento no encontrado'
      });
    }

    const existingParticipation = await EventParticipation.findOne({
      where: {
        user_id: user.id,
        event_id: id
      }
    });

    if (existingParticipation) {
      return res.status(400).json({
        code: -7,
        message: 'Ya estás registrado en este evento'
      });
    }

    const participation = await EventParticipation.create({
      user_id: user.id,
      event_id: id,
      registration_date: new Date()
    });

    res.status(200).json({
      code: 1,
      message: 'Participación registrada correctamente',
      data: participation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al registrar la participación'
    });
  }
};

export const getParticipants = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [
        {
          model: EventParticipation,
          include: [
            {
              model: User,
              attributes: ['id', 'first_name', 'last_name', 'email', 'profile_picture' ]
            }
          ]
        }
      ]
    });

    if (!event) {
      return res.status(404).json({
        code: -6,
        message: 'Evento non trovato'
      });
    }

    const participants = await Promise.all(event.EventParticipations.map(async participation => {
      let profilePictureUrl = null;
      if (participation.User.profile_picture) {
        // const storageRef = ref(storage, participation.User.profile_picture);
        try {
          // profilePictureUrl = await getDownloadURL(storageRef);
          profilePictureUrl = await generateSignedUrl(participation.User.profile_picture);
        } catch (error) {
          if (error.code === 'storage/object-not-found') {
            console.warn(`File not found: ${participation.User.profile_picture}`);
            profilePictureUrl = null;
          } else {
            throw error;
          }
        }
      }
      return {
        id: participation.User.id,
        first_name: participation.User.first_name,
        last_name: participation.User.last_name,
        email: participation.User.email,
        profile_picture: profilePictureUrl
      };
    }));

    res.status(200).json({
      code: 1,
      message: 'Lista dei partecipanti',
      data: participants
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Errore durante il recupero dei partecipanti',
      error: error.message
    });
  }
};

export const uploadEventPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ code: -1, message: "Evento non trovato" });
    }

    if (!req.file) {
      return res.status(400).json({ code: -1, message: "Nessun file ricevuto" });
    }

    // Elimina la foto precedente
    if (event.photo) {
      await deleteFile(event.photo);
    }

    // Carica la nuova foto
    const { url, path } = await processAndUploadFile(req.file, "event_photos");
    event.photo = path; // Salva il percorso nel database
    await event.save();

    res.status(200).json({
      code: 1,
      message: "Foto dell'evento caricata correttamente",
      data: { photo: url },
    });
  } catch (error) {
    console.error("Errore durante il caricamento della foto dell'evento:", error);
    res.status(500).json({
      code: -100,
      message: "Errore durante il caricamento della foto dell'evento",
      error: error.message,
    });
  }
};

export const deleteEventPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ code: -1, message: "Evento non trovato" });
    }

    if (event.photo) {
      await deleteFile(event.photo); // Elimina la foto da Firebase
      event.photo = null; // Rimuovi il riferimento dal database
      await event.save();
    }

    res.status(200).json({
      code: 1,
      message: "Foto dell'evento eliminata correttamente",
    });
  } catch (error) {
    console.error("Errore durante l'eliminazione della foto:", error);
    res.status(500).json({
      code: -100,
      message: "Errore durante l'eliminazione della foto dell'evento",
      error: error.message,
    });
  }
};

export const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        code: -6,
        message: 'Evento no encontrado'
      });
    }

    // Verifica se l'utente è iscritto
    const existingParticipation = await EventParticipation.findOne({
      where: {
        user_id: user.id,
        event_id: id
      }
    });

    if (!existingParticipation) {
      return res.status(400).json({
        code: -7,
        message: 'No estás registrado en este evento'
      });
    }

    await existingParticipation.destroy();

    res.status(200).json({
      code: 1,
      message: 'Participación eliminada correctamente'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al eliminar la participación'
    });
  }
};