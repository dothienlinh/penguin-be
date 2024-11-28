import { NotificationType } from '@libs/enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsNotEmpty()
  @IsBoolean()
  isRead: boolean;
}
