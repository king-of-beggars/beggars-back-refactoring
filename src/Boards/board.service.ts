import { Injectable } from "@nestjs/common";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Board } from "./entity/board.entity";
import { PostBoardDto } from "./dto/postBoard.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { CashbookService } from "src/Cashlists/cashbook.service";
import { Cashbook } from "src/Cashlists/entity/cashbook.entity";
import { GetByCashbookIdDto } from "src/Cashlists/dto/getByCashbookId.dto";
import { GetByBoardIdDto } from "./dto/getByBoardId.dto";
import { DeleteFail, ReadFail } from "src/Utils/exception.service";
import { BoardRepository } from "./board.repository";
import { BoardResDto } from "./dto/boardRes.dto";
import { CashbookRepository } from "src/Cashlists/repository/cashbook.repsitory";
import { PointValue } from "src/Utils/pointValue.enum";
import { UserRepository } from "src/Users/user.repository";
import { UserService } from "src/Users/service/user.service";
import { CommentService } from "src/Comments/comment.service";
import { LikeRepository } from "src/Comments/like.repository";

@Injectable()
export class BoardService {
    constructor(
        private boardRepository : BoardRepository,
        private cashbookRepository : CashbookRepository,
        private userRepository : UserRepository,
        private userService : UserService,
        //pirvate cashlistRepository :Repository<CashlistEntity>
        private readonly dataSource : DataSource,
        private readonly commentService : CommentService,
        private readonly likeRepository : LikeRepository
    ){} 
    
    async postBoard(postBoardDto : PostBoardDto, cashbookId : number) : Promise<any> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        let message: string;
        try {
            let boardTypes: number;
            const cashbook = await this.cashbookRepository.cashbookAndDetail(
                cashbookId
            );

            cashbook.cashbookNowValue > cashbook.cashbookGoalValue
                ? (boardTypes = 1)
                : (boardTypes = 0); 
            postBoardDto.userId = cashbook.userId;
            postBoardDto.boardTypes = boardTypes;
            postBoardDto.cashbookId = cashbook;

            cashbook.cashbookNowValue > cashbook.cashbookGoalValue
            ? await this.userRepository.inputPoint(cashbook.userId.userId, PointValue.nowayPoint, queryRunner)
            : await this.userRepository.inputPoint(cashbook.userId.userId, PointValue.goodjobPoint, queryRunner);
            boardTypes == 0
            ? (message = `자랑하기 등록이 완료됐습니다`) 
            : (message = `혼나러가기 등록이 완료됐습니다`);    

            await this.boardRepository.postBoard(postBoardDto,queryRunner)
            return message
        } catch(e) {
            await queryRunner.rollbackTransaction()
        } finally {
            await queryRunner.commitTransaction()
        }
    } 
 
    async deleteByboardId(boardId : number) : Promise<any> {
        
        return this.boardRepository.deleteByboardId(boardId)
        
    }

    async getListAll(paginationDto : PaginationDto, boardTypes? : number) : Promise<any> {
        try {
            const checkPage = await this.boardRepository.checkNextPage(paginationDto,boardTypes)
            const boards =  await this.boardRepository.readByPage(paginationDto, boardTypes)

            let hasNextPage = false
            checkPage.length===0 ? hasNextPage=false : hasNextPage=true
            const pageNum = paginationDto.page

            const result : any = {
            boards,
            pageNum,
            hasNextPage
            }
            return result;
        } catch(e) { 
            throw new ReadFail(e.stack)
        }
    }

    async getBoardDetail(boardId : number) : Promise<any> {
        try {
            const result : any = await this.boardRepository.readBoardDetail(boardId)
            const tokenCheck = await this.userService.tokenCheck()
            let likeCheck;
            let likeList;
            //댓글이 있을 경우
            if (result.comments.length > 0) {
              const like = result.comments.map((comment) => comment.commentId);
              //토큰에서 유저정보 추출
              //좋아요 개수
              likeList = await this.commentService.getLikeList(like);
              const tokenCheck = await this.userService.tokenCheck()
              tokenCheck
                  ? (likeCheck = await this.likeRepository.readByUserIdAndCommentIds(
                        tokenCheck.userId, 
                        like
                    ))
                  : {};
              }
      
              for (let i = 0; result.comments.length > i; i++) {
                result.comments[i].likeCount =
                  Number(likeList[result.comments[i].commentId]) || 0;
                result.comments[i].likeCheck =
                  likeCheck[result.comments[i].commentId] || 0;
              }
              return result;
        } catch(e) {
            throw new ReadFail(e.stack)
        }
    }

    async getDetailByBoardId(boardId : number) : Promise<Cashbook> {
        try {
            const boards = await this.boardRepository.joinCashbook(boardId)
            const cashbookId = boards.cashbookId.cashbookId
            return await this.cashbookRepository.cashbookAndDetail(cashbookId)
        } catch(e) {
            throw new ReadFail(e.stack)
        }
        
    }

    async boardCheck(cashbookIds : number[]) {
        try {
            const query = await this.boardRepository.boardByCashbookId(cashbookIds)
            const result = {}
            for(let i=0; query.length>i; i++) {
                result[query[i].cashbookId] = query[i].boardId 
            }
            return result;
        } catch(e) {
            throw new ReadFail(e.stack)
        }

    }

}