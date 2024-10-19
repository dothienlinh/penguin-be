import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { ErrorHandler } from '@libs/utils/error-handler';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  private readonly logger = new Logger(CategoriesService.name);

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async isExist(name: string) {
    try {
      return await this.categoryRepository.findOne({ where: { name } });
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = await this.isExist(createCategoryDto.name);
      if (category) {
        throw new ConflictException('Category already exists');
      }

      return await this.categoryRepository.create(createCategoryDto).save();
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  async findAll() {
    try {
      return await this.categoryRepository.find();
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  async findOne(id: number) {
    try {
      return await this.categoryRepository.findOneBy({ id });
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      return await this.categoryRepository.update(id, updateCategoryDto);
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  async remove(id: number) {
    try {
      const category = await this.findOne(id);
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return await category.softRemove();
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }

  async restore(id: number) {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id, deletedAt: Not(IsNull()) },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }

      return await category.recover();
    } catch (error) {
      this.handleError(error, 'Internal server error');
    }
  }
}
