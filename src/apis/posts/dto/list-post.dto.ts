import { PaginationDto } from '@libs/base/base.dto';
import { OmitType, IntersectionType } from '@nestjs/swagger';
import { GetPostDto } from './get-post.dto';

export class ListPostDto extends IntersectionType(
  OmitType(PaginationDto, ['from', 'to'] as const),
  GetPostDto,
) {}
