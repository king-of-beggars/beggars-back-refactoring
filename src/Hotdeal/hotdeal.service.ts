import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Hotdeal } from './hotdeal.entity';
import { HotdealByIdDto } from './dto/hotdealById.dto';
import { HotdealApplyDto } from './dto/hotdealApply.dto';
import { QueryRunner } from 'typeorm';
import { CreateFail, DeleteFail, ReadFail, UpdateFail } from 'src/Utils/exception.service';
import { HotdealAddDto } from './dto/hotdealAdd.dto';
import { HotdealRepository } from './hotdeal.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {Inject} from '@nestjs/common';
import { LockService } from 'src/Utils/lock.service';
import { HotdealListDto } from './dto/hotdealList.dto';

@Injectable()
export class HotdealService {
    constructor(  
        private readonly hotdealRepository : HotdealRepository
    ){}
    
    //핫딜 리스트
    async getHotdealList () {
        return await this.hotdealRepository.readHotdeal()
    }

    //핫딜 winner 추가
    async registWinner (
        hotdealApplyDto : HotdealApplyDto
    ) {
        this.hotdealRepository.postHotdeal(hotdealApplyDto)
    }   

    //핫딜 재고 minus
    async updateInventory (
        hotdealId : number,
        updateNumber : number
    ) {
        try {
            await this.hotdealRepository.updateInventory(hotdealId,updateNumber)
        } catch(e) {
            throw new UpdateFail(e.stack)
        }
    }

    //핫딜 제거
    async hotdealDelete (hotdealId : number) {
        return await this.hotdealRepository.deleteHotdeal(hotdealId)
    }

    async addHotdeal (hotdealAdd : HotdealAddDto) {
        return await this.hotdealRepository.postByAdmin(hotdealAdd)
    }

    async readInventory (
        hotdealId : number
    ) {
        return this.hotdealRepository.readCheckInventory(hotdealId)
    }

}