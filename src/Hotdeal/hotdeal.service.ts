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

@Injectable()
export class HotdealService {
    constructor(  
        private readonly hotdealRepository : HotdealRepository,
        private readonly dataSource : DataSource,
        private readonly lockService : LockService
    ){}
    
    //핫딜 리스트
    async getHotdealList () {
        return await this.hotdealRepository.readHotdeal()
    }

    //핫딜 winner 추가
    async registWinner (
        hotdealApplyDto : HotdealApplyDto
    ) {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            await this.hotdealRepository.readByHotdealId(hotdealApplyDto.hotdealId, queryRunner)
            await this.hotdealService.minusInventory(hotdealByIdDto,queryRunner)
            await this.hotdealService.registWinner(hotdealApplyDto,queryRunner)
        } catch(e) {
            await queryRunner.rollbackTransaction()
            throw new CreateFail(e.stack)
        } finally {
            await queryRunner.commitTransaction()
        }
    }   

    //핫딜 재고 minus
    async updateInventory (
        hotdealId : number,
        updateNumber : number
    ) {
        try {
            return this.hotdealRepository.updateInventory(hotdealId,updateNumber)

        } catch(e) {
            throw new UpdateFail(e.stack)
        }
    }

    //핫딜 제거
    async hotdealDelete (hotdealId : number) {
        return await this.hotdealRepository.deleteHotdeal(hotdealId)
    }

    //핫딜 등록
    async addHotdeal (hotdealAdd : HotdealAddDto) {
        try {
            console.log(hotdealAdd)
            const query = this.hotdeal.create(
                hotdealAdd 
            )
            await this.hotdeal.save(query)
        } catch(e) {
            console.log(e)
            throw new CreateFail(e.stack)
        }
    }

    async readInventory (
        hotdealByIdDto : HotdealByIdDto, 
        queryRunner : QueryRunner
    ) {
        return await queryRunner.manager
        .createQueryBuilder()
        .select('Hotdeal')
        .where('hotdealId=:hotdealId',{hotdealId : hotdealByIdDto.hotdealId})
        .andWhere('hotdealLimit>0')
        .getOne()
    }

}