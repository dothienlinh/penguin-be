import { Role } from '@apis/roles/entities/role.entity';
import { BaseService } from '@libs/base/base.service';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class RolesService extends BaseService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {
    super(RolesService.name);
  }

  async getRoles() {
    try {
      const roles = await this.entityManager.find(Role);
      return roles;
    } catch (error) {
      this.logger.error(error);
      this.handleError(error, 'Error fetching roles');
    }
  }
}
