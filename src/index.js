// app.js
import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors'; //para poder hacer puts, y tal desde el cliente al servidor
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import testRoutes from './routes/testRoutes.js';
import { testConnection } from './db.js';
import dotenv from 'dotenv';
import { insertInitialData } from './start_data.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();



const app = express();

// Configurazione di __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Creazione automatica delle directory "uploads" e "uploads-event" se non esistono
const uploadDir = path.join(__dirname, 'uploads');
const eventUploadDir = path.join(__dirname, 'uploads-event');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log(`Cartella ${uploadDir} creata con successo`);
}

if (!fs.existsSync(eventUploadDir)) {
  fs.mkdirSync(eventUploadDir);
  console.log(`Cartella ${eventUploadDir} creata con successo`);
}

// Configura el middleware CORS para que peuda recibir solicitudes de POST, PUT, DELETE, UPDATE, etc.
app.use(cors({
  credentials: true,
  origin: process.env.CLIENT_URL
}));

//header and populate req.cookies with an object keyed by the cookie names
app.use(cookieParser());


// Middleware para analizar el cuerpo de las solicitudes con formato JSON
app.use(express.json());

// Middleware para analizar el cuerpo de las solicitudes con datos de formulario
app.use(express.urlencoded({ extended: true })); // Para analizar datos de formularios en el cuerpo de la solicitud

// const __filename=fileURLToPath(import.meta.url);
// const __dirname=path.dirname(__filename)

// Servir archivos estáticos desde la carpeta "uploads"
app.use("/uploads", express.static(uploadDir));
app.use("/uploads-event", express.static(eventUploadDir));
// app.use("/uploads", express.static(path.join(__dirname,"uploads")));
// app.use("/uploads-event", express.static(path.join(__dirname,"uploads-event")));

await testConnection();
await insertInitialData();

// Configurar rutas
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/events', eventRoutes);
app.use('/test', testRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
