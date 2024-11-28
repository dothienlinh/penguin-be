import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReadNotificationsDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
