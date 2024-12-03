
import util from "util";
import multer from "multer";
import path from 'path';
import sharp from "sharp";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig"
import dotenv from "dotenv";

dotenv.config();
const isProduction = process.env.NODE_ENV === "production"; // Verifica l'ambiente

const maxSize = 2 * 1024 * 1024;

// Configurazione Multer
const storageLocal = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./src/uploads/"); // Salva localmente
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const storageMemory = multer.memoryStorage(); // Salva in memoria per Firebase

const uploadFile = multer({
  storage: isProduction ? storageMemory : storageLocal, // Usa memoria in produzione, locale in sviluppo
  limits: { fileSize: maxSize },
}).single("file");

export const uploadFileMiddleware = util.promisify(uploadFile);

// Funzione per il caricamento su Firebase (produzione)
export const processAndUploadFile = async (file) => {
  // Comprimi il file con Sharp
  const compressedBuffer = await sharp(file.buffer)
    .resize({ width: 800 }) // Ridimensiona
    .jpeg({ quality: 80 }) // Comprimi
    .toBuffer();

  // Carica su Firebase
  const fileName = `${file.fieldname}-${Date.now()}.jpeg`;
  const storageRef = ref(storage, `uploads/${fileName}`); // Cartella nel bucket

  const snapshot = await uploadBytes(storageRef, compressedBuffer); // Carica
  const downloadURL = await getDownloadURL(snapshot.ref); // Ottieni URL

  return downloadURL;
};