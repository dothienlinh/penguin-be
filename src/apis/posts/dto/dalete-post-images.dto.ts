import { IsArray, IsNumber } from 'class-validator';

export class DeletePostImagesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  imageIds: number[];
}
