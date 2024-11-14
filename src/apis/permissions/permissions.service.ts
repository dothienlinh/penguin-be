import { ByRole, Permission as PermissionEnum, Roles } from '@libs/enums';
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
import {
  DEFAULT_PERMISSIONS_ADMIN,
  DEFAULT_PERMISSIONS_USER,
} from '@libs/constants';
import { plainToInstance } from 'class-transformer';
import { BaseService } from '@libs/base/base.service';
import { Role } from '@apis/roles/entities/role.entity';

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
      .returning('*')
      .execute();
  }

  async createPermissions() {
    try {
      await this.permissionRepository.manager.transaction(async (manager) => {
        const [adminRole, userRole] = await Promise.all([
          manager.findOne(Role, {
            where: { name: Roles.ADMIN },
            relations: ['permissions'],
          }),
          manager.findOne(Role, {
            where: { name: Roles.USER },
            relations: ['permissions'],
          }),
        ]);

        if (!adminRole || !userRole) {
          throw new Error('Roles not found');
        }

        const adminPermissions = await Promise.all(
          DEFAULT_PERMISSIONS_ADMIN.map(async (name) => {
            let permission = await manager.findOne(Permission, {
              where: { name },
            });
            if (!permission) {
              permission = manager.create(Permission, { name });
              permission = await manager.save(Permission, permission);
            }
            return permission;
          }),
        );

        const userPermissions = await Promise.all(
          DEFAULT_PERMISSIONS_USER.map(async (name) => {
            let permission = await manager.findOne(Permission, {
              where: { name },
            });
            if (!permission) {
              permission = manager.create(Permission, { name });
              permission = await manager.save(Permission, permission);
            }
            return permission;
          }),
        );

        adminRole.permissions = adminPermissions;
        userRole.permissions = userPermissions;

        await Promise.all([
          manager.save(Role, adminRole),
          manager.save(Role, userRole),
        ]);
      });

      return true;
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
    const defaultPermissionNames = [...DEFAULT_PERMISSIONS_USER];
    const permissions = await this.permissionRepository.findBy({
      name: In(defaultPermissionNames),
    });

    return plainToInstance(Permission, permissions);
  }

  async findAll() {
    try {
      return await this.permissionRepository.find({
        select: { id: true, name: true },
      });
    } catch (error) {
      this.handleError(error, 'Error finding all permissions');
    }
  }

  async findOne(id: number) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { id },
        select: { id: true, name: true },
      });
      if (!permission) {
        throw new NotFoundException('Permission not found');
      }
      return permission;
    } catch (error) {
      this.handleError(error, 'Error finding permission');
    }
  }

  async getPermissionsByRole(role: ByRole) {
    try {
      const permissions = await this.permissionRepository.find({
        where: { roles: { name: role as unknown as Roles } },
        select: { id: true, name: true },
      });

      return permissions;
    } catch (error) {
      this.handleError(error, 'Error getting permissions by role');
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
