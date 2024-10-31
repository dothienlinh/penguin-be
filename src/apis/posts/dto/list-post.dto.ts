import { PaginationDto } from '@libs/base/base.dto';
import { OmitType } from '@nestjs/swagger';

export class ListPostDto extends OmitType(PaginationDto, [
  'from',
  'to',
] as const) {}
