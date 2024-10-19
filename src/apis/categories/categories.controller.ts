import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { Permissions } from '@libs/decorators/permissions.decorator';
import { Permission } from '@libs/enums';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions(Permission.WRITE_CATEGORY)
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @Permissions(Permission.READ_CATEGORY)
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @Permissions(Permission.READ_CATEGORY)
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  @Permissions(Permission.UPDATE_CATEGORY)
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  @Permissions(Permission.DELETE_CATEGORY)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}
