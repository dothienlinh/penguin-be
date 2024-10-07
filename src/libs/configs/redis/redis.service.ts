import { RedisType } from '@libs/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async set(redisData: RedisType) {
    const { key, value, expired: ttl } = redisData;
    return await this.cache.set(key, value, ttl);
  }

  async get<T>(key: string) {
    return await this.cache.get<T>(key);
  }

  async del(key: string) {
    return await this.cache.del(key);
  }

  async clear() {
    return await this.cache.reset();
  }
}
