import { Comment } from "./entity/comment.entity";
import { Injectable } from "@nestjs/common/decorators";
import { DataSource, Repository, QueryRunner } from "typeorm";
import { PostCommentDto } from "./dto/postComment.dto";


@Injectable()
export class CommentRepository extends Repository<Comment> {

    async createComment(postCommentDto : PostCommentDto, queryRunner : QueryRunner) {
        const result = await queryRunner.manager.createQueryBuilder()
        .insert()
        .into(Comment)
        .values(postCommentDto)
        .execute()
        return result.raw
    }

    async deleteComment(userId : number, commentId : number) {
        return await this.createQueryBuilder('comment')
        .delete()
        .where('commentId=:commentId', {
          commentId
        })
        .andWhere('userId=:userId', { userId})
        .execute();
    }
}