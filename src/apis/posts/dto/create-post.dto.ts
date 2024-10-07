import { OmitType } from '@nestjs/swagger';
import { CreatePostWithImagesDto } from './create-post-with-images.dto';

export class CreatePostDto extends OmitType(CreatePostWithImagesDto, [
  'images',
] as const) {}
