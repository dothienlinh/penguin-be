import { Logger } from '@nestjs/common';
import { ErrorHandler } from '@libs/utils/error-handler.utils';
import { SelectQueryBuilder } from 'typeorm';
import { plainToInstance } from 'class-transformer';

export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  protected handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`);
    return ErrorHandler.handle(error, message);
  }

  protected async getPaginated<T>(
    queryBuilder: SelectQueryBuilder<T>,
    page: number,
    size: number,
    classType: new () => T,
  ) {
    const [result, total] = await queryBuilder.getManyAndCount();
    const totalPage = Math.ceil(total / size);

    return {
      result: plainToInstance(classType, result),
      meta: {
        totalPage,
        currentPage: page,
        pageSize: size,
        totalRecords: total,
      },
    };
  }
}
