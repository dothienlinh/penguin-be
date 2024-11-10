import { plainToInstance } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';

export const responsePagination = async <T>(
  queryBuilder: SelectQueryBuilder<T>,
  page: number,
  size: number,
  classType: new (...args: any[]) => T,
) => {
  const [posts, total] = await queryBuilder.getManyAndCount();
  const totalPage = Math.ceil(total / size);

  return {
    result: plainToInstance(classType, posts),
    meta: {
      totalPage,
      currentPage: page,
      pageSize: size,
      totalRecords: total,
    },
  };
};
