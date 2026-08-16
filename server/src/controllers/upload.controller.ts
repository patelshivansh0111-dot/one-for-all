import { Request, Response } from 'express';
import { sendSuccess } from '../utils/helpers';
import { badRequest } from '../utils/apiError';
import { getFileUrl } from '../middleware/upload';
import { isCloudinaryConfigured } from '../config/cloudinary';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) throw badRequest('No image file provided');

  const url = getFileUrl(req.file);
  sendSuccess(
    res,
    {
      url,
      filename: req.file.originalname,
      size: req.file.size,
      storage: isCloudinaryConfigured() ? 'cloudinary' : 'local',
    },
    'Image uploaded',
    201
  );
};

export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) throw badRequest('No video file provided');

  const url = getFileUrl(req.file);
  sendSuccess(
    res,
    {
      url,
      filename: req.file.originalname,
      size: req.file.size,
      storage: isCloudinaryConfigured() ? 'cloudinary' : 'local',
    },
    'Video uploaded',
    201
  );
};

export const uploadMultiple = async (req: Request, res: Response): Promise<void> => {
  const files = req.files as Express.Multer.File[];
  if (!files?.length) throw badRequest('No files provided');

  const uploads = files.map((file) => ({
    url: getFileUrl(file),
    filename: file.originalname,
    size: file.size,
  }));

  sendSuccess(res, { uploads, storage: isCloudinaryConfigured() ? 'cloudinary' : 'local' }, 'Files uploaded', 201);
};
