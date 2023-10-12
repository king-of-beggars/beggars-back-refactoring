import { Injectable, Inject} from '@nestjs/common';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';

export class LockService {
    constructor(
        @InjectRedis()
        private readonly redisClient: Redis,
  ) {}

  async setLock(key : string, time : number) : Promise<Boolean> {
    try {
        const result = await this.redisClient.set(key, 'locked', 'EX', time, 'NX')
        return result==='OK';
    } catch(e) {
        return false;
    }
  }

  async deleteLock(key : string) {
    await this.redisClient.del(key)
  } 

}