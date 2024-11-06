import { IntersectionType } from '@nestjs/swagger';
import { CreatePostDto } from './create-post.dto';
import { GetPostDto } from './get-post.dto';

export class UpdatePostDto extends IntersectionType(
  CreatePostDto,
  GetPostDto,
) {}
