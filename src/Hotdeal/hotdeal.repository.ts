import { Hotdeal } from "./hotdeal.entity";
import { QueryRunner, Repository } from "typeorm";
export class HotdealRepository extends Repository<Hotdeal> {

    async postHotdeal() {
        await this.createQueryBuilder('hotdeal')
    }

    async postByAdmin() {

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
    
}