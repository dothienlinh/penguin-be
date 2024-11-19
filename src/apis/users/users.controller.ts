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
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { QueryListDto } from '@libs/base/base.dto';
import { SearchUserDto } from './dto/search-user.dto';

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

  @Get('top')
  async getTopUsers(@CurrentUser() user: User) {
    return this.usersService.getTopUsers(user);
  }

  @Get(':id/posts')
  async getPostsByUserId(
    @Param('id') id: number,
    @Query() query: QueryListDto,
  ) {
    return this.usersService.getPostsByUserId(id, query);
  }

  @Get('search')
  async searchUser(@Query() query: SearchUserDto) {
    return this.usersService.searchUser(query);
  }

  @Permissions(Permission.READ_USER)
  @Get('following')
  async getFollowers(@CurrentUser() user: User, @Query() query: QueryListDto) {
    return this.usersService.getFollowers(user.id, query);
  }

  @Permissions(Permission.READ_USER)
  @Get('followers')
  async getFollowing(@CurrentUser() user: User, @Query() query: QueryListDto) {
    return this.usersService.getFollowing(user.id, query);
  }

  @Permissions(Permission.READ_USER)
  @Get(':username')
  @ApiOperation({ summary: 'Get user by username' })
  async findOne(
    @Param('username') username: string,
    @CurrentUser() user: User,
  ) {
    return await this.usersService.findOneByUsername(username, user);
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

  @Patch('activate')
  @ApiOperation({ summary: 'Activate user' })
  async activate(@CurrentUser() user: User) {
    return await this.usersService.updateActiveStatus(user.id, true);
  }

  @Patch('deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@CurrentUser() user: User) {
    return await this.usersService.updateActiveStatus(user.id, false);
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
