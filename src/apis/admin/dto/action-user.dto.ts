import { PickType } from '@nestjs/swagger';
import { DeletePostDto } from './action-post.dto';

export class DeleteUserDto extends DeletePostDto {}

export class RestoreUserDto extends PickType(DeleteUserDto, ['id']) {}
