import { ApiProperty } from '@nestjs/swagger';
import { Express } from 'express';

export class UploadFilesDto {
  @ApiProperty({ type: 'array', items: { type: 'string', format: 'binary' } })
  images: Express.Multer.File[];
}
