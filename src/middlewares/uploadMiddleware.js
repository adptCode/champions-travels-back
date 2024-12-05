import multer from "multer";
import sharp from "sharp";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../firebaseConfig.js";

// Configura multer per salvare i file in memoria
const maxSize = 5 * 1024 * 1024; // 5 MB
const storageMemory = multer.memoryStorage();

export const uploadMiddleware = multer({
  storage: storageMemory,
  limits: { fileSize: maxSize },
}).single("file");

// Carica e comprime il file su Firebase
export const processAndUploadFile = async (file, folder = "uploads") => {
  console.log("Inizio processo di upload...");

  if (!file || !file.buffer) {
    console.error("Dettagli del file ricevuto:", file);
    throw new Error("File non valido o mancante");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    console.error("Formato non supportato:", file.mimetype);
    throw new Error("Formato file non supportato");
  }

  try {
    console.log("Compressione del file...");
    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 800 })
      .jpeg({ quality: 80 })
      .toBuffer();

    console.log("File compresso con successo");

    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const storageRef = ref(storage, fileName);

    console.log("Caricamento su Firebase...");
    const snapshot = await uploadBytes(storageRef, compressedBuffer);

    const url = await getDownloadURL(snapshot.ref);
    console.log("URL del file:", url);

    return url;
  } catch (error) {
    console.error("Errore durante il caricamento del file:", error);
    throw error;
  }
};

// Elimina un file da Firebase
export const deleteFile = async (filePath) => {
  const storageRef = ref(storage, filePath);
  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Errore nell'eliminazione del file su Firebase:", error);
  }
};
