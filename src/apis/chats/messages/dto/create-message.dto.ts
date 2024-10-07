import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ObjectId } from 'typeorm';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @IsNumber()
  @IsNotEmpty()
  senderId: number;

  @IsNotEmpty()
  @IsMongoId()
  chatRoomId: ObjectId;
}
