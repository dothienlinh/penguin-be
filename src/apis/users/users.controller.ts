import { Permissions } from '@libs/decorators/permissions.decorator';
import { Public } from '@libs/decorators/public.decorator';
import { ResponseMessage } from '@libs/decorators/responseMessage.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import { Permission } from '@libs/enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Permissions(Permission.READ_USER)
  @Get('')
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Permissions(Permission.READ_USER)
  @Get('followers')
  async getFollowers(@CurrentUser() user: User) {
    return this.usersService.getFollowers(user.id);
  }

  @Permissions(Permission.READ_USER)
  @Get('following')
  async getFollowing(@CurrentUser() user: User) {
    return this.usersService.getFollowing(user.id);
  }

  @Permissions(Permission.READ_USER)
  @Get(':username')
  @ApiOperation({ summary: 'Get user by username' })
  async findOne(@Param('username') username: string) {
    return await this.usersService.findOneByUsername(username);
  }

  @Permissions(Permission.READ_USER)
  @Get(':id/profile')
  @ApiOperation({ summary: 'Get profile user' })
  async getProfileUser(@Param('id') id: number) {
    return await this.usersService.getProfileUser(id);
  }

  @Permissions(Permission.UPDATE_USER)
  @Patch(':id/restore')
  @Public()
  @ApiOperation({ summary: 'Restore user' })
  async restore(@Param('id') id: number) {
    return await this.usersService.restore(id);
  }

  @Permissions(Permission.WRITE_USER)
  @Post(':id/follow')
  async followUser(@Param('id') id: number, @CurrentUser() user: User) {
    return this.usersService.followUser(id, user);
  }

  @Patch('')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateUserDto })
  @ApiOperation({ summary: 'Update user' })
  @ResponseMessage('Updated user successfully')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
    @CurrentUser() user: User,
  ) {
    const avatarUrl = avatar ? avatar.filename : null;
    return await this.usersService.update(updateUserDto, avatarUrl, user);
  }

  @Permissions(Permission.UPDATE_USER)
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  async activate(@CurrentUser() user: User) {
    return await this.usersService.updateActivateUser(true, user);
  }

  @Permissions(Permission.UPDATE_USER)
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@CurrentUser() user: User) {
    return await this.usersService.updateActivateUser(false, user);
  }

  @Permissions(Permission.DELETE_USER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@CurrentUser() user: User) {
    return await this.usersService.delete(user.id);
  }

  @Permissions(Permission.WRITE_USER)
  @Delete(':id/unfollow')
  async unfollowUser(@Param('id') id: number, @CurrentUser() user: User) {
    return this.usersService.unfollowUser(id, user);
  }
}
