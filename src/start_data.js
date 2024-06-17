import User from './models/userModel.js';
import Event from './models/eventModel.js';
import EventParticipation from './models/participationModel.js';

const insertInitialData = async () => {
  const users = [
    {
      email: 'ismael.academy@gmail.com',
      password: '$2b$10$tXrqo7VdSPCLAsIUhrVsYejYeMt9FLo9J4OchgCKwuDvpeDK6Xf1q', //pass: ismael123
      first_name: 'Ismael',
      last_name: 'Apellido',
      birth_date: '1980-01-01',
      city: 'Madrid',
      country: 'España',
      role: 'user'
    },
    {
      email: 'laura@hotmail.com',
      password: '$2b$10$tXrqo7VdSPCLAsIUhrVsYejYeMt9FLo9J4OchgCKwuDvpeDK6Xf1q', //pass: ismael123
      first_name: 'Laura',
      last_name: 'Apellido',
      birth_date: '1990-01-01',
      city: 'Barcelona',
      country: 'España',
      role: 'user'
    },
    {
      email: 'admin@hotmail.com',
      password: '$2b$10$tXrqo7VdSPCLAsIUhrVsYejYeMt9FLo9J4OchgCKwuDvpeDK6Xf1q', //pass: ismael123
      first_name: 'Admin',
      last_name: 'Apellido',
      birth_date: '1970-01-01',
      city: 'Sevilla',
      country: 'España',
      role: 'admin'
    }
  ];

  await User.bulkCreate(users, { ignoreDuplicates: true });

  const events = [
    {
      title: 'Final de la Champions',
      description: 'La gran final de la Champions League',
      event_date: '2024-06-10 18:00:00',
      location: 'Estadio Metropolitano, Madrid',
    },
    {
      title: 'Semifinal',
      description: 'Semifinal de la Champions League',
      event_date: '2024-05-10 18:00:00',
      location: 'Stamford Bridge, Londres',
    }
  ];

  await Event.bulkCreate(events, { ignoreDuplicates: true });

  const participations = [
    {
      user_id: 1,
      event_id: 1,
      registration_date: '2024-06-11 19:25:51'
    },
    {
      user_id: 2,
      event_id: 2,
      registration_date: '2024-06-11 19:25:51'
    }
  ];

  await EventParticipation.bulkCreate(participations, { ignoreDuplicates: true });


}

export { insertInitialData };