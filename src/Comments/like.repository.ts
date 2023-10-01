import { Comment } from "./entity/comment.entity";
import { Injectable } from "@nestjs/common/decorators";
import { DataSource, Repository, QueryRunner } from "typeorm";
import { Like } from "./entity/like.entity";
import { UpdateLikeDto } from "./dto/updateLike.dto";


@Injectable()
export class LikeRepository extends Repository<Like> {

    async readByCommentIds(commentId : number[]) {
        return await this.createQueryBuilder('like')
        .select('like.commentId', 'commentId')
        .addSelect('COUNT(like.likeId)', 'likeCount')
        .where('like.commentId IN (:...commentId)', { commentId })
        .andWhere('like.likeCheck=1')
        .groupBy('like.commentId')
        .getRawMany();

    }

    async readByUserIdAndCommentId(userId : number, commentId : number) {
        return await this
        .createQueryBuilder('like')
        .select()
        .where('userId=:userId', { userId })
        .andWhere('commentId=:commentId', { commentId })
        .getOne();
    }

    async readByUserIdAndCommentIds(userId : number, commentIds : number[]) {
        return await this
        .createQueryBuilder('like')
        .select('like.commentId', 'commentId')
        .addSelect('like.likeCheck', 'likeCheck')
        .where('like.userId=:userId', { userId })
        .andWhere('like.commentId IN (:...commentId)', { commentIds })
        .andWhere('like.likeCheck=1')
        .getRawMany();
    }

    async createLike(userId : number, commentId : number) : Promise<any> {
        return await this.createQueryBuilder('like')
        .insert()
        .into(Like)
        .values({userId : userId, commentId : commentId})
        .execute()

    }

    async updateLike(updateLikeDto : UpdateLikeDto) {
        return await this.createQueryBuilder('like')
        .update()
        .set({
            likeCheck: () =>
              `${updateLikeDto.likeCheck}`,
        })
        .where('cashbookId=:cashbookId', {userId : updateLikeDto.userId})
        .andWhere('commentId=:commentId', {commentId : updateLikeDto.commentId})
        .execute();
    }
    
}