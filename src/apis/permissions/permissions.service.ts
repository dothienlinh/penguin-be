import { Permission as PermissionEnum } from '@libs/enums';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { PERMISSIONS_USER_ONLY } from '@libs/constants';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@libs/base/base.service';

@Injectable()
export class PermissionsService extends BaseService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {
    super(PermissionsService.name);
  }

  async isExist(name: PermissionEnum) {
    const permission = await this.permissionRepository.findOne({
      where: { name },
    });
    return !!permission;
  }

  async createMany(permissions: CreatePermissionDto[]) {
    return await this.permissionRepository
      .createQueryBuilder()
      .insert()
      .values(permissions)
      .execute();
  }

  async createPermissions() {
    try {
      const permissions = Object.values(PermissionEnum).map((permission) => ({
        name: permission,
      }));

      const isExistPermissions = await this.findAll();

      if (!isExistPermissions.length) {
        return await this.createMany(permissions);
      }

      const namePermissions = isExistPermissions.map(
        (permission) => permission.name,
      );

      const createPermissions = permissions.filter(
        (permission) => !namePermissions.includes(permission.name),
      );

      if (createPermissions.length) {
        return await this.createMany(createPermissions);
      }
    } catch (error) {
      this.handleError(error, 'Error creating permissions');
    }
  }

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const permission = await this.isExist(createPermissionDto.name);
      if (permission) {
        throw new ConflictException('Permission already exists');
      }
      const newPermission =
        this.permissionRepository.create(createPermissionDto);
      return await this.permissionRepository.save(newPermission);
    } catch (error) {
      this.handleError(error, 'Error creating permission');
    }
  }

  async getDefaultPermissionsUser() {
    const defaultPermissionNames = [...PERMISSIONS_USER_ONLY];
    const permissions = await this.permissionRepository.findBy({
      name: In(defaultPermissionNames),
    });

    return plainToInstance(Permission, permissions);
  }

  async findAll() {
    try {
      return await this.permissionRepository.find();
    } catch (error) {
      this.handleError(error, 'Error finding all permissions');
    }
  }

  async findOne(id: number) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id },
      });
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }
      return permission;
    } catch (error) {
      this.handleError(error, 'Error finding permission');
    }
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    try {
      const permission = await this.findOne(id);
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }
      return await this.permissionRepository.save(updatePermissionDto);
    } catch (error) {
      this.handleError(error, 'Error updating permission');
    }
  }

  async remove(id: number) {
    try {
      const permission = await this.findOne(id);
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }
      return await this.permissionRepository.delete(id);
    } catch (error) {
      this.handleError(error, 'Error removing permission');
    }
  }
}
