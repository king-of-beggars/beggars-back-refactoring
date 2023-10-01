import {
  Controller,
  Post,
  Delete,
  UseGuards,
  Param,
  Body,
  Req,
} from '@nestjs/common';
import { Comment } from './entity/comment.entity';
import { CommentService } from './comment.service';
import { PostCommentDto } from './dto/postComment.dto';
import User from 'src/Users/user.entity';
import { AccessAuthenticationGuard } from 'src/Users/passport/jwt/access.guard';
import { Board } from 'src/Boards/entity/board.entity';
import { DeleteResult } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetByBoardIdDto } from 'src/Boards/dto/getByBoardId.dto';
import { GetByCommentIdDto } from './dto/getByCommentId.dto';
import { GetByUserIdDto } from 'src/Users/dto/getByUserId.dto';
import { UserService } from 'src/Users/service/user.service';
import { DataSource } from 'typeorm';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { CommentTextDto } from './dto/commentText.dto';
import { PointValue } from 'src/Utils/pointValue.enum';

@ApiTags('댓글/좋아요 API')
@Controller('api/board/:boardId/comment')
export class CommentController {
  constructor(
    private readonly commentService: CommentService,
    private readonly userService: UserService,
    private dataSource: DataSource
    ) {}

  @Post('')
  @UseGuards(AccessAuthenticationGuard)
  @ApiOperation({
    summary: '댓글 입력',
    description: '댓글 입력, 포인트 1점 기입',
  })
  @ApiParam({ name: 'boardId', type: 'number' })
  async postComment(
    @Param('boardId') boardId: number,
    @Body('commentText') commentText: string,
    @Req() req: any,
  ) {
      let { user } = req;
      let postCommentDto : PostCommentDto= {
        userId: user.userId,
        boardId: boardId,
        commentText : commentText
      };
      return await this.commentService.postComment(postCommentDto)
    
  }

  @Delete(':commentId')
  @UseGuards(AccessAuthenticationGuard)
  @ApiOperation({
    summary: '댓글 삭제',
    description: '삭제가 완료되었습니다 리턴',
  })
  async deleteComment(
    @Param('commentId') commentId: number,
    @Req() req: any,
  ) {
      let { user } = req;
      await this.commentService.deleteComment(
        user.userId,
        commentId 
      );
      return `삭제가 완료되었습니다`;
  }//end method
}//end class
