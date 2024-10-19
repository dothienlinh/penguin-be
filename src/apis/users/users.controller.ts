import { Public } from '@libs/decorators/public.decorator';
import { CurrentUser } from '@libs/decorators/user.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { Permission } from '@libs/enums';

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
  @Get(':id/followers')
  async getFollowers(@Param('id') id: number) {
    return this.usersService.getFollowers(id);
  }

  @Permissions(Permission.READ_USER)
  @Get(':id/following')
  async getFollowing(@Param('id') id: number) {
    return this.usersService.getFollowing(id);
  }

  @Permissions(Permission.READ_USER)
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id') id: number) {
    return await this.usersService.findOneById(id);
  }

  @Permissions(Permission.READ_USER)
  @Get(':id/profile')
  @ApiOperation({ summary: 'Get profile user' })
  async getProfileUser(@Param('id') id: number) {
    return await this.usersService.getProfileUser(id);
  }

  @Permissions(Permission.UPDATE_USER)
  @Post(':id/restore')
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

  @Permissions(Permission.UPDATE_USER)
  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Permissions(Permission.UPDATE_USER)
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  async activate(@Param('id') id: number) {
    return await this.usersService.updateActivateUser(id, true);
  }

  @Permissions(Permission.UPDATE_USER)
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@Param('id') id: number) {
    return await this.usersService.updateActivateUser(id, false);
  }

  @Permissions(Permission.DELETE_USER)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: number) {
    return await this.usersService.delete(id);
  }

  @Permissions(Permission.WRITE_USER)
  @Delete(':id/unfollow')
  async unfollowUser(@Param('id') id: number, @CurrentUser() user: User) {
    return this.usersService.unfollowUser(id, user);
  }
}
