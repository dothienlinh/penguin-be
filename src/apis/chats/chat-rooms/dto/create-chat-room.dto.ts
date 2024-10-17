import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateChatRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsNotEmpty()
  members: number[];
}
