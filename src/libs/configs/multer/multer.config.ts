import { FILE_TYPES, MAX_FILE_SIZE, UPLOAD_FOLDER } from '@libs/constants';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { mkdir } from 'fs/promises';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  private readonly rootPath = process.cwd();
  private readonly uploadFolder = UPLOAD_FOLDER;
  private readonly allowedTypes = FILE_TYPES;
  private readonly maxFileSize = MAX_FILE_SIZE;

  async createMulterOptions(): Promise<MulterModuleOptions> {
    await this.ensureUploadDirectoryExists();

    return {
      storage: diskStorage({
        destination: join(this.rootPath, 'public', this.uploadFolder),
        filename: (req, file, cb) => {
          const uniqueFilename = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueFilename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (this.allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type'), false);
        }
      },
      limits: { fileSize: this.maxFileSize },
    };
  }

  private async ensureUploadDirectoryExists(): Promise<void> {
    const targetDirectory = join(this.rootPath, 'public', this.uploadFolder);
    try {
      await mkdir(targetDirectory, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        console.error('Failed to create upload directory:', error);
        throw new Error(
          'Unable to create upload directory. Please check server permissions.',
        );
      }
    }
  }
}
