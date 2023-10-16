import { Injectable, Inject} from '@nestjs/common';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';

export class LockService {
    constructor(
        @InjectRedis()
        private readonly redisClient: Redis,
  ) {}

  async setLock(key : string, time : number, maxRetries : number) : Promise<Boolean> {
    try {
        let retry = 0
        while(retry < maxRetries) {
          const result = await this.redisClient.set(key, 'locked', 'EX', time, 'NX')
          if(result) {
            return result==='OK';
          }
          retry++
          await new Promise(e=> setTimeout(e,500))
        }
        return false;
    } catch(e) {
        return false;
    }
  }

  async deleteLock(key : string) {
    await this.redisClient.del(key)
  } 

}