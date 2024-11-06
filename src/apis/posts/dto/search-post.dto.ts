import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { ListPostDto } from './list-post.dto';

export class SearchPostDto extends ListPostDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Search value', default: '' })
  title?: string = '';
}
