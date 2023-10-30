import { Injectable } from "@nestjs/common/decorators";
import { DataSource, Repository, QueryRunner } from "typeorm";
import { CashDetail } from "../entity/cashDetail.entity";
import { PostDetailDto } from "../dto/postDetail.dto";

@Injectable()
export class CashDetailRepository extends Repository<CashDetail> {
    constructor(private dataSource: DataSource){
        super(CashDetail, dataSource.createEntityManager())
    }

    async createDetail(postDetailDto : PostDetailDto, queryRunner? : QueryRunner)  {
        await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(CashDetail)
        .values(postDetailDto)
        .execute()
    }

    async readById(cashDetailId : number) : Promise<CashDetail> {
        return await this.createQueryBuilder('cashDetail')
        .where('cashDetailId=:cashDetailId', {cashDetailId})
        .getOne()
        
    }

    async readByCashbookId(cashbookId : number) {
        return await this.createQueryBuilder('cashDetail')
        .where('cashDetail.cashbookId=:cashbookId', {cashbookId})
        .orderBy('cashDetail.cashDetailCreatedAt', 'ASC')
        .getMany();

    }

    async cashDetailCreate() {
        
    }

    async deleteById(cashDetailId : number, queryRunner? : QueryRunner) {
        return await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('cashDetail')
        .where('cashDetail.cashDetailId=:cashDetailId', {cashDetailId})
        .execute();
    }

}