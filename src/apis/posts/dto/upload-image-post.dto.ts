import { UploadFileDto } from '@apis/upload/dto/upload-file.dto';
import { ImageType } from '@libs/enums';
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { GetPostDto } from './get-post.dto';

export class UploadImagePostDto extends IntersectionType(
  UploadFileDto,
  GetPostDto,
) {
  @ApiProperty({
    enum: ImageType,
    example: ImageType.THUMBNAIL,
    description: 'Type of image (thumbnail or image)',
  })
  @IsNotEmpty()
  @IsEnum(ImageType)
  type: ImageType;
}
