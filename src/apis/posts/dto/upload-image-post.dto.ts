import { IsEnum, IsNotEmpty } from 'class-validator';
import { ImageType } from '@libs/enums';
import { ApiProperty } from '@nestjs/swagger';
import { UploadFileDto } from '@apis/upload/dto/upload-file.dto';

export class UploadImagePostDto extends UploadFileDto {
  @ApiProperty({
    enum: ImageType,
    example: ImageType.THUMBNAIL,
    description: 'Type of image (thumbnail or image)',
  })
  @IsNotEmpty()
  @IsEnum(ImageType)
  type: ImageType;
}
