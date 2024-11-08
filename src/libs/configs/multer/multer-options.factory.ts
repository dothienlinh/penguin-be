import { FILE_TYPES, MAX_FILE_SIZE, UPLOAD_FOLDER } from '@libs/constants';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface CustomMulterOptions {
  fileTypes?: string[];
  maxFileSize?: number;
  uploadFolder?: string;
}

export const createMulterOptions = async (
  options?: CustomMulterOptions,
): Promise<MulterOptions> => {
  const {
    fileTypes = FILE_TYPES,
    maxFileSize = MAX_FILE_SIZE,
    uploadFolder = UPLOAD_FOLDER,
  } = options || {};

  const rootPath = process.cwd();
  const destination = join(rootPath, 'public', uploadFolder);

  try {
    await mkdir(destination, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw new Error('Unable to create upload directory');
    }
  }

  return {
    storage: diskStorage({
      destination,
      filename: (req, file, cb) => {
        const uniqueFilename =
          Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + uuidv4();
        cb(null, `${uniqueFilename}-${file.originalname}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (fileTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new BadRequestException(
            `Invalid file type. Allowed types: ${fileTypes.join(', ')}`,
          ),
          false,
        );
      }
    },
    limits: { fileSize: maxFileSize },
  };
};
