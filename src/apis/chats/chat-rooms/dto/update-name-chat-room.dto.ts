import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateNameChatRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
