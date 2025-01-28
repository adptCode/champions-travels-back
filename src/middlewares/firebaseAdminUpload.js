// firebaseAdminUpload.js
import multer from "multer";
import sharp from "sharp";
import { bucket } from "../firebaseAdmin.js";  // <-- en vez de "firebaseConfig.js"

// 1. Configurar multer
const maxSize = 5 * 1024 * 1024; // 5 MB
const storageMemory = multer.memoryStorage();
export const uploadMiddleware = multer({
  storage: storageMemory,
  limits: { fileSize: maxSize },
}).single("file");

// 2. Lógica para comprimir y subir usando Admin SDK
export const processAndUploadFile = async (file, folder = "uploads") => {
  console.log("Inizio processo di upload...");

  if (!file?.buffer) {
    console.error("Dettagli del file ricevuto:", file);
    throw new Error("File non valido o mancante");
  }

  // Validar tipo de archivo
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    console.error("Formato non supportato:", file.mimetype);
    throw new Error("Formato file non supportato");
  }

  try {
    console.log("Compressione del file...");
    const compressedBuffer = await sharp(file.buffer)
      .resize({ width: 800 })         // ajusta ancho a 800px
      .jpeg({ quality: 80 })          // calidad 80%
      .toBuffer();

    console.log("File compresso con successo");

    // 3. Determinar ruta en el bucket
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const fileRef = bucket.file(fileName);

    console.log("Caricamento su Firebase (Admin SDK)...");
    // 4. Sube el buffer directamente
    await fileRef.save(compressedBuffer, {
      metadata: {
        contentType: file.mimetype,
      },
      // Si quieres que sea público: { public: true }
    });

    // 5. Obtener Signed URL (si no es público)
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2030',
    });

    console.log("URL del file:", signedUrl);

    return { url: signedUrl, path: fileName };
  } catch (error) {
    console.error("Errore durante il caricamento del file:", error);
    throw error;
  }
};

// 6. Eliminar archivo
export const deleteFile = async (filePath) => {
  try {
    await bucket.file(filePath).delete();
    console.log("Eliminato correttamente:", filePath);
  } catch (error) {
    console.error("Errore nell'eliminazione del file su Firebase:", error);
  }
};

// AQUÍ creas la función para obtener la Signed URL de un path dado
export const generateSignedUrl = async (filePath) => {
    const fileRef = bucket.file(filePath);
    const [signedUrl] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2030',
    });
    return signedUrl;
  };
