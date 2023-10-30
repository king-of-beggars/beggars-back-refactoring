import User from "./user.entity";
import { Injectable } from "@nestjs/common/decorators";
import { DataSource, Repository, QueryRunner } from "typeorm";

@Injectable()
export class UserRepository extends Repository<User> {
    async readById() {

    }

    async readUserCreatedAt() {
        
    }

    async inputPoint(userId: number, point: number, queryRunner?: QueryRunner) {
        try {
            return await queryRunner.manager
            .createQueryBuilder()
            .update('User')
            .set({
                userPoint: () =>
                `userPoint + ${point}`,
            })
            .where('userId = :userId', { userId })
            .execute();
            } catch(e) {
                
            }

    }
}