// cloudinary.service.ts

import { FolderUpload } from '@libs/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { createReadStream } from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File, folder: FolderUpload) {
    return new Promise<UploadApiResponse | UploadApiErrorResponse>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(
                new BadRequestException('Upload image to cloudinary failed'),
              );
              return;
            }
            resolve(result);
          },
        );

        createReadStream(file.buffer).pipe(stream);
      },
    );
  }

  async deleteFile(publicId: string[]) {
    return await cloudinary.api.delete_resources(publicId, (error, result) => {
      if (error) {
        throw new BadRequestException('Delete image to cloudinary failed');
      }
      return result;
    });
  }
}
