import { Injectable } from "@nestjs/common/decorators";
import { DataSource, Repository, QueryRunner } from "typeorm";
import { CashList } from "../entity/cashList.entity";
import { PostDetailDto } from "../dto/postDetail.dto";
import { FrameDto } from "../dto/frame.dto";

@Injectable()
export class CashListRepository extends Repository<CashList> {
    constructor(private dataSource: DataSource){
        super(CashList, dataSource.createEntityManager())
    }

    async createFrame(frameDto: FrameDto, queryRunner?: QueryRunner) {
        const result = await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(CashList)
        .values(frameDto)
        .execute()
        return result.raw
    }
    

}