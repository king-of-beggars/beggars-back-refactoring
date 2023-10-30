import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PostCommentDto } from './dto/postComment.dto';
import User from 'src/Users/user.entity';
import { UserService } from 'src/Users/service/user.service';
import { EntityManager } from 'typeorm';
import { Like } from './entity/like.entity';
import { GetByUserIdDto } from 'src/Users/dto/getByUserId.dto';
import { GetByCommentIdDto } from './dto/getByCommentId.dto';
import { CreateFail, DeleteFail, ReadFail } from 'src/Utils/exception.service';
import { LikeRepository } from './like.repository';
import { UpdateLikeDto } from './dto/updateLike.dto';
import { UserRepository } from 'src/Users/user.repository';
import { CommentRepository } from './comment.respository';
import { PointValue } from 'src/Utils/pointValue.enum';


@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: CommentRepository,
    private readonly likeRepository : LikeRepository,
    private readonly userRepository : UserRepository,
    private readonly dataSource : DataSource
  ) {}

  async postComment(postCommentDto: PostCommentDto) {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()
    try {
      await this.commentRepository.createComment(postCommentDto, queryRunner)
      await this.userRepository.inputPoint(postCommentDto.userId, PointValue.commentPoint, queryRunner)
    } catch(e) { 
      await queryRunner.rollbackTransaction()
      throw new CreateFail(e.stack)
    } finally {
      await queryRunner.commitTransaction()
    }
  }

  async deleteComment(userId : number, commentId : number) {
    try {
      return await this.commentRepository.deleteComment(userId, commentId)
    } catch(e) { 
      throw new DeleteFail(e.stack)
    }
  }

  async postLike(userId: number, commentId: number) {
    let likeCheck = 0;
    try {
      let query = await this.likeRepository.readByUserIdAndCommentId(userId,commentId)
      if (!query) { 
        return await this.likeRepository.createLike(userId, commentId)
      } else {
        query.likeCheck === 1 ? (likeCheck = 0) : (likeCheck = 1);
        let updateLikeDto : UpdateLikeDto = {
          userId, commentId, likeCheck
        }
        return await this.likeRepository.updateLike(updateLikeDto)
      } 
      
    } catch(e) {
      console.log(e)
      throw new CreateFail(e.stack)
    }
  }

  async getLikeList(commentId: number[]) {
    try {
      const query = await this.likeRepository.readByCommentIds(commentId)
      const result = {};
      for (let i = 0; query.length > i; i++) {
        result[query[i].commentId] = query[i].likeCount;
      }
      return result;
    } catch(e) {
      throw new ReadFail(e.stack)  
    }
  }
}
