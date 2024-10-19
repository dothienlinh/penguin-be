import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsNotEmpty({ each: true })
  members: number[];
}
