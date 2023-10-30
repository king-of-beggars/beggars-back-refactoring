import { HotdealAddDto } from "./dto/hotdealAdd.dto";
import { HotdealApplyDto } from "./dto/hotdealApply.dto";
import { Hotdeal } from "./hotdeal.entity";
import { QueryRunner, Repository } from "typeorm";
export class HotdealRepository extends Repository<Hotdeal> {

    async postHotdeal(hotdealApplyDto : HotdealApplyDto) : Promise<Hotdeal> {
        const result = await this.createQueryBuilder('hotdeal')
        .insert()
        .into(Hotdeal)
        .values(hotdealApplyDto)
        .execute()
        return result.raw
    }

    async postByAdmin(hotdealAddDto : HotdealAddDto) {
        const result = await this.createQueryBuilder('hotdeal')
        .insert()
        .into(Hotdeal)
        .values(hotdealAddDto)
        .execute()
        return result.raw
    }

    async readByHotdealId(hotdealId : number) {
        

    }

    async readHotdeal() : Promise<Hotdeal[]> {
        return this.createQueryBuilder('hotdeal')
        .select()
        .getMany()
    }

    async updateInventory(hotdealId : number, updateNumber : number) {
        return await this.createQueryBuilder()
        .update('Hotdeal')
        .set({ 
            userPoint: () =>
            `hotdealLimit + ${updateNumber}`,
        })
        .where('hotdealId = :hotdealId', { hotdealId })
        .execute();

    }

    async deleteHotdeal(hotdealId : number) : Promise<Hotdeal> {
        const result = await this.createQueryBuilder('hotdeal')
        .delete()
        .where('hotdealId=:hotdealId', { hotdealId })
        .execute()
        return result.raw
    }
    
    async readCheckInventory(hotdealId : number) : Promise<Hotdeal> {
        return await this
        .createQueryBuilder('hotdeal')
        .select('Hotdeal')
        .where('hotdealId=:hotdealId',{hotdealId})
        .andWhere('hotdealLimit>0')
        .getOne()
    }
}