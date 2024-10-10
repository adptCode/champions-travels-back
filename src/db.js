import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DATABASE,    // Nome del database
  process.env.USER_NAME,   // Nome utente
  process.env.PASSWORD,    // Password
  {
    host: process.env.HOST_NAME,  // Host del database
    port: process.env.DB_PORT || 3306,    // Porta MySQL
    dialect: 'postgres',
    dialectOptions: isProduction ? {  // Attiva SSL solo in produzione
      connectTimeout: 60000,  // Imposta il timeout a 30 second
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false
      // }
    } : {},  // Nessun SSL in locale
    logging: console.log  // Abilita il logging per debug
  }
);

// const sequelize = new Sequelize(
//   process.env.DATABASE,
//   process.env.USER_NAME,
//   process.env.PASSWORD,
//   {
//     host: process.env.HOST_NAME,
//     dialect: 'mysql'
//   }
// );

const syncModels = async () => {
  try {
    await sequelize.sync({ force: false }).then(() => {
      console.log('Modelos sincronizados con la base de datos');
    }); 
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
  
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await syncModels();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export { sequelize, testConnection };