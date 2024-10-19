import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { ErrorHandler } from '@libs/utils/error-handler';
import { Roles } from '@libs/enums';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  private readonly logger = new Logger(RolesService.name);

  async isExist(name: Roles) {
    const role = await this.roleRepository.findOne({ where: { name } });
    return !!role;
  }

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  async createMany(roles: CreateRoleDto[]) {
    return await this.roleRepository
      .createQueryBuilder()
      .insert()
      .values(roles)
      .execute();
  }

  async createRoles() {
    try {
      const roles = Object.values(Roles).map((role) => ({ name: role }));

      const isExistRoles = await this.findAll();

      if (!isExistRoles.length) {
        return await this.createMany(roles);
      }

      const nameRoles = isExistRoles.map((role) => role.name);

      const createRoles = roles.filter(
        (role) => !nameRoles.includes(role.name),
      );

      if (createRoles.length) {
        return await this.createMany(createRoles);
      }
    } catch (error) {
      this.handleError(error, 'Error creating roles');
    }
  }

  async create(createRoleDto: CreateRoleDto) {
    try {
      const role = await this.isExist(createRoleDto.name);
      if (role) {
        throw new ConflictException('Role already exists');
      }
      const newRole = this.roleRepository.create(createRoleDto);
      return await this.roleRepository.save(newRole);
    } catch (error) {
      this.handleError(error, 'Error creating role');
    }
  }

  async findAll() {
    try {
      return await this.roleRepository.find();
    } catch (error) {
      this.handleError(error, 'Error finding all roles');
    }
  }

  async findOne(id: number) {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      return role;
    } catch (error) {
      this.handleError(error, 'Error finding role');
    }
  }

  async findOneByName(name: Roles) {
    try {
      const role = await this.roleRepository.findOne({ where: { name } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      return role;
    } catch (error) {
      this.handleError(error, 'Error finding role');
    }
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      return await this.roleRepository.save(updateRoleDto);
    } catch (error) {
      this.handleError(error, 'Error updating role');
    }
  }

  async remove(id: number) {
    try {
      const role = await this.roleRepository.findOne({ where: { id } });
      if (!role) {
        throw new NotFoundException('Role not found');
      }
      return await this.roleRepository.delete({ id });
    } catch (error) {
      this.handleError(error, 'Error removing role');
    }
  }
}
