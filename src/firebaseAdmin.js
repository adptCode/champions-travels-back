// firebaseAdmin.js
import admin from 'firebase-admin';

import fs from 'fs';
import path from 'path';
//import serviceAccount from '../serviceAccountKey.json'; // Ruta real de tu JSON

// Obtén la ruta real a tu archivo JSON (en caso de ESM)
const serviceKeyPath = path.resolve('serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceKeyPath, 'utf-8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Si quieres definir tu bucket explícitamente:
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, 
});

export const bucket = admin.storage().bucket();
