import { FILE_TYPES, MAX_FILE_SIZE } from '@libs/constants';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { memoryStorage } from 'multer';

interface CustomMulterOptions {
  fileTypes?: string[];
  maxFileSize?: number;
}

export const createMulterOptions = async (
  options?: CustomMulterOptions,
): Promise<MulterOptions> => {
  const { fileTypes = FILE_TYPES, maxFileSize = MAX_FILE_SIZE } = options || {};

  return {
    storage: memoryStorage(),
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
