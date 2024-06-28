import User from './models/userModel.js';
import Event from './models/eventModel.js';
import EventParticipation from './models/participationModel.js';

const insertInitialData = async () => {
  const users = [
    
  ];

  await User.bulkCreate(users, { ignoreDuplicates: true });

  const events = [
    
  ];

  await Event.bulkCreate(events, { ignoreDuplicates: true });

  const participations = [
    
  ];

  await EventParticipation.bulkCreate(participations, { ignoreDuplicates: true });


}

export { insertInitialData };