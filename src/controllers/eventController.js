import Event from '../models/eventModel.js';
import EventParticipation from '../models/participationModel.js';
import User from '../models/userModel.js';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutaArchivo = path.join(__dirname, '../uploads');

export const getEvents = async (req, res) => {
  try {
    const events = await Event.findAll();
    res.status(200).json({
      code: 1,
      message: 'Lista de Eventos',
      data: events
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener los eventos',
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        code: -6,
        message: 'Evento no encontrado'
      });
    }
    res.status(200).json({
      code: 1,
      message: 'Detalle del Evento',
      data: event
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener el evento'
    });
  }
};

export const addEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, event_date, location } = req.body;
    /**/ const eventPhoto = req.file ? req.file.filename : null;
    const newEvent = await Event.create({ title, description, event_date, location, /**/ photo: eventPhoto });

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
    const { title, description, event_date, location } = req.body;
    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({
        code: -6,
        message: 'Evento no encontrado'
      });
    }

    /* */ 
    if (req.file) {
      if (event.photo) {
        const oldPath = path.join(rutaArchivo, event.photo);
        fs.unlink(oldPath, (err) => {
          if (err) console.error(err);
        });
      }
      event.photo = req.file.filename;
    }

    /* */

    event.title = title;
    event.description = description;
    event.event_date = event_date;
    event.location = location;
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
        message: 'Evento no encontrado'
      });
    }

    const participants = event.EventParticipations.map(participation => ({
      id: participation.User.id,
      first_name: participation.User.first_name,
      last_name: participation.User.last_name,
      email: participation.User.email,
      profile_picture: participation.User.profile_picture
    }));

    res.status(200).json({
      code: 1,
      message: 'Lista de participantes',
      data: participants
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: -100,
      message: 'Ha ocurrido un error al obtener los participantes'
    });
  }
};
