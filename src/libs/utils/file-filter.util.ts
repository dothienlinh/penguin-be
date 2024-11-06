import { IMAGE_TYPES } from '@libs/constants';
import { BadRequestException } from '@nestjs/common';

export const imageFileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  if (!IMAGE_TYPES.includes(file.mimetype)) {
    return callback(
      new BadRequestException('Only image files are allowed!'),
      false,
    );
  }
  callback(null, true);
};
