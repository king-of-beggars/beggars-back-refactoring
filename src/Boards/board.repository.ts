import { Injectable } from "@nestjs/common/decorators";
import { DataSource, Repository, QueryRunner } from "typeorm";
import { Board } from "./entity/board.entity"
import { PaginationDto } from "./dto/pagination.dto";
import { PostBoardDto } from "./dto/postBoard.dto";

@Injectable()
export class BoardRepository extends Repository<Board> {

    async boardByCashbookId(cashbookIds : Number[]) : Promise<any> {
        return await this.createQueryBuilder('board')
        .select('boardId')
        .addSelect('cashbookId')
        .where('cashbookId IN (:...cashbookIds)',{cashbookIds})
        .getRawMany()
    }

    async readByPage(paginationDto : PaginationDto, boardTypes?: number) : Promise<Board[]> {
        return await this.createQueryBuilder('board')
        .leftJoin('board.cashbookId','cashbook')
        //.innerJoinAndSelect('cashbookId.cashbookId','cashdetail')
        .leftJoin('board.userId','user')
        .select(['board','cashbook','user.userNickname','user.userName'])
        .where('board.boardTypes=:boardTypes', {boardTypes})
        .orderBy('board.boardCreatedAt',"DESC")
        .skip((paginationDto.page-1)*paginationDto.limit)
        .take(paginationDto.limit) 
        .getMany()

    }

    async checkNextPage(paginationDto : PaginationDto, boardTypes?: number) : Promise<any> {
        return await this.createQueryBuilder('board')
        .where('boardTypes=:boardTypes', {boardTypes})
        .skip((paginationDto.page)*paginationDto.limit)
        .take(paginationDto.limit)
        .getMany()
        
    }

    async postBoard(postBoardDto : PostBoardDto, queryRunner? : QueryRunner) {
        return await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Board)
        .values(postBoardDto)
        .execute()
    }

    async readBoardDetail(boardId : number) : Promise<Board> {
        return await this
            .createQueryBuilder('board')
            .leftJoinAndSelect('board.userId','user')
            .leftJoinAndSelect('board.comments','comment')
            .leftJoinAndSelect('comment.userId','commentUser')
            .leftJoinAndSelect('comment.likes','like')
            .select([
            'board',
            'comment',
            'comment.userId',
            'user.userId',
            'user.userNickname',
            'user.userName',
            'commentUser.userId',
            'commentUser.userName',
            'commentUser.userNickname'])
            .where('board.boardId=:boardId',{boardId})
            .getOne()
    }

    async joinCashbook(boardId : number) {
        return await this
        .createQueryBuilder('board')
        .leftJoinAndSelect('board.cashbookId','cashbook')
        .where('board.boardId=:boardId',{boardId})
        .getOne()

    }
    async deleteByboardId(boardId : number) { 
        return this.createQueryBuilder('board')
        .delete()
        .where({boardId})

    }
}