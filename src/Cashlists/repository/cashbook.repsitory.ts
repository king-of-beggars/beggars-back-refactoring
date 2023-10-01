import { Injectable } from "@nestjs/common/decorators";
import { DataSource, Repository, QueryRunner } from "typeorm";
import { Cashbook } from "../entity/cashbook.entity";
import { ValueUpdateDto } from "../dto/valueUpdate.dto";
import { QueryDate } from "../dto/queryDate.dto";
import { CashbookCreateDto } from "../dto/cashbookCreate.dto";

@Injectable()
export class CashbookRepository extends Repository<Cashbook> {
    constructor(private dataSource: DataSource){
        super(Cashbook, dataSource.createEntityManager())
    }

    async readById(cashbookId : number) {
        return await this.createQueryBuilder('cashbook')
        .where('cashbookId=:cashbookId',{cashbookId})
        .getOne()
    }

    async addValue(valueUpdate: ValueUpdateDto, queryRunner? : QueryRunner): Promise<any> {
        try {
          await queryRunner.manager
            .createQueryBuilder()
            .update('Cashbook')
            .set({
              cashbookNowValue: () =>
                `cashbookNowValue + ${valueUpdate.cashDetailValue}`,
            })
            .where('cashbookId=:cashbookId', {
              cashbookId: valueUpdate.cashbookId,
            })
            .execute();
        } catch(e) {
            
        }
      }

    async readByDateCashbook(date : QueryDate, userId : Number) {
          return await this.createQueryBuilder('cashbook')
          .select(['cashbookId', 'cashbookName', 'cashbookCategory', 'cashbookNowValue', 'cashbookGoalValue'])
          .where('DATE(cashbookCreateAt)=DATE(:date)')
          .andWhere('userId=:userId')
          .orderBy('cashbookCreatedAt', 'DESC')
          .getMany()

    }

    async cashbookById(cashbookId : number) {
        return await this.createQueryBuilder('cashbook')
        .select()
        .where('cashbookId=:cashbookId', {cashbookId})
        .getOne();

    }

    async updateConsumer(cashbookNowValue : number, cashbookId : number) {
        return await this.createQueryBuilder('cashbook')
        .update()
        .set({
          cashbookNowValue: () =>
            `${cashbookNowValue}`,
        })
        .where('cashbookId=:cashbookId', {cashbookId})
        .execute();

    }

    async createCashbook(cashbookCreateDto : CashbookCreateDto, queryRunner : QueryRunner) {
      const result = await queryRunner.manager.createQueryBuilder()
      .insert()
      .into(Cashbook)
      .values(cashbookCreateDto)
      .execute()
      return result.raw
    }

    async cashbookAndDetail(cashbookId : number) : Promise<Cashbook> {
      return await this.createQueryBuilder('cashbook')
      .innerJoinAndSelect('cashbook.detail', 'cashDetail')
      .innerJoinAndSelect('cashbook.userId', 'user.userId')
      .where('cashbook.cashbookId=:cashbookId', {
        cashbookId
      })
      .getOne();
    }


}