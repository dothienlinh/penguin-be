import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from '@libs/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  async findOne(@Param('id') id: number) {
    return await this.usersService.findOneById(id);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get profile user' })
  async getProfileUser(@Param('id') id: number) {
    return await this.usersService.getProfileUser(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(id, updateUserDto);
  }

  @Post(':id/restore')
  @Public()
  @ApiOperation({ summary: 'Restore user' })
  async restore(@Param('id') id: number) {
    return await this.usersService.restore(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  async activate(@Param('id') id: number) {
    return await this.usersService.updateActivateUser(id, true);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@Param('id') id: number) {
    return await this.usersService.updateActivateUser(id, false);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: number) {
    return await this.usersService.delete(id);
  }
}
