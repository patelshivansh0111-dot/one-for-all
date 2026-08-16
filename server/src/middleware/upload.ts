import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';

const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
const allowedVideoTypes = /mp4|webm|mov|avi/;
const allowedDocTypes = /pdf|doc|docx|txt/;

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  if (
    allowedImageTypes.test(ext) ||
    allowedVideoTypes.test(ext) ||
    allowedDocTypes.test(ext)
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const localStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const createCloudinaryStorage = (folder: string, resourceType: 'image' | 'video' | 'auto') =>
  new CloudinaryStorage({
    cloudinary,
    params: async (_req, file) => ({
      folder: `one-for-all/${folder}`,
      resource_type: resourceType,
      public_id: `${Date.now()}-${path.parse(file.originalname).name}`,
    }),
  });

const limits = { fileSize: 10 * 1024 * 1024 };

export const uploadImage = isCloudinaryConfigured()
  ? multer({ storage: createCloudinaryStorage('images', 'image'), limits, fileFilter })
  : multer({ storage: localStorage, limits, fileFilter });

export const uploadVideo = isCloudinaryConfigured()
  ? multer({
      storage: createCloudinaryStorage('videos', 'video'),
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter,
    })
  : multer({ storage: localStorage, limits: { fileSize: 50 * 1024 * 1024 }, fileFilter });

export const uploadAvatar = isCloudinaryConfigured()
  ? multer({
      storage: createCloudinaryStorage('avatars', 'image'),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter,
    })
  : multer({ storage: localStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

export const getFileUrl = (file: Express.Multer.File): string => {
  const cloudinaryFile = file as Express.Multer.File & { path?: string };
  if (isCloudinaryConfigured() && cloudinaryFile.path) {
    return cloudinaryFile.path;
  }
  return `/uploads/${file.filename}`;
};
