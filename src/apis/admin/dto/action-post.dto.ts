import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class DeletePostDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  removedReason: string;
}

export class RestorePostDto extends PickType(DeletePostDto, ['id']) {}
