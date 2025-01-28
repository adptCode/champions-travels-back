// firebaseAdmin.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
dotenv.config(); // carga las variables de entorno

let serviceAccount;

// import fs from 'fs';
// import path from 'path';
//import serviceAccount from '../serviceAccountKey.json'; // Ruta real de tu JSON

// Obtén la ruta real a tu archivo JSON (en caso de ESM)
// const serviceKeyPath = path.resolve('serviceAccountKey.json');
// const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf-8'));

if (process.env.FIREBASE_SERVICE_ACCOUNT_B64) {
  // Estamos en producción (o tienes la var de entorno configurada)
  const base64Key = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  serviceAccount = JSON.parse(
    Buffer.from(base64Key, 'base64').toString('utf-8')
  );
} else {
  // Estamos en local DEV (no tengo la variable B64)
  // Cargar el archivo JSON directamente
  // Nota: si usas Node 20 con ESM, quizá necesitas import assertions o leer con fs
  serviceAccount = await import('../serviceAccountKey.json', {
    assert: { type: 'json' }
  }).then(module => module.default);
  // Alternativa con fs:
  // import fs from 'fs';
  // const raw = fs.readFileSync('./config/serviceAccountKey.json', 'utf-8');
  // serviceAccount = JSON.parse(raw);
}

// Inicializa Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Si quieres definir tu bucket explícitamente:
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, 
});

export const bucket = admin.storage().bucket();
