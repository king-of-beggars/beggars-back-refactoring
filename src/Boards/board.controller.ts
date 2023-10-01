import {
  Controller,
  Post,
  Req,
  Res,
  Body,
  UseGuards,
  Get,
  Query,
  Delete,
  Param,
  HttpCode,
} from '@nestjs/common';
import { AccessAuthenticationGuard } from 'src/Users/passport/jwt/access.guard';
import { BoardService } from './board.service';
import { CashbookService } from 'src/Cashlists/cashbook.service';
import { CashDetail } from 'src/Cashlists/entity/cashDetail.entity';
import { PostBoardDto } from './dto/postBoard.dto';
import { PaginationDto } from './dto/pagination.dto';
import { Response, Request } from 'express';
import { UserService } from 'src/Users/service/user.service';
import { CommentService } from 'src/Comments/comment.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { BoardResDto } from './dto/boardRes.dto';
import { BoardDetailResDto } from './dto/boarDetailRes.dto';
import { GetByCashbookIdDto } from 'src/Cashlists/dto/getByCashbookId.dto';
import { GetByBoardIdDto } from './dto/getByBoardId.dto';
import { DataSource, QueryRunner } from 'typeorm';
import { PointValue } from 'src/Utils/pointValue.enum';
import { HttpException } from '@nestjs/common/exceptions';
import { HttpStatus } from '@nestjs/common/enums';
import { GetByUserIdDto } from 'src/Users/dto/getByUserId.dto';

@Controller('api/board')
@ApiTags('게시물 API')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly cashbookService: CashbookService,
    private readonly userService: UserService,
    private readonly commentService: CommentService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  @Get('noway')
  @ApiResponse({
    status: 200,
    type: [BoardResDto],
    description: '혼나러가기 게시물 목록',
  })
  async nowayList(@Query() paginationDto: PaginationDto) {
      const result : BoardResDto[] = await this.boardService.getListAll(paginationDto,1);
      return {
        data: result,
      }
  }

  @Get('goodjob')
  @ApiResponse({
    status: 200,
    type: [BoardResDto],
    description: '자랑하기 게시물 정보',
  })
  async goodjobList(@Query() paginationDto: PaginationDto) {
      const result : BoardResDto[] = await this.boardService.getListAll(paginationDto,0);
      return {
        data: result,
      }
  }

  //NAME 추가
  @Post(':cashbookId')
  @UseGuards(AccessAuthenticationGuard)
  @ApiBody({
    type: PostBoardDto,
  })
  @ApiResponse({
    status: 201,
    type: String,
    description:
      '자랑하기 등록이 완료됐습니다 || 혼나러가기 등록이 완료됐습니다',
  })
  async boardInput(
    @Param('cashbookId') cashbookId: number,
    @Body() postBoardDto: PostBoardDto,
    @Req() req: any,
  ) {
      return await this.boardService.postBoard(postBoardDto,cashbookId);
  }

  @ApiResponse({
    type: BoardDetailResDto,
  })
  @Get('detail/:boardId')
  async boardDetail(
    @Param('boardId') boardId: number,
    @Req() req: any,
  ) {
      return await this.boardService.getBoardDetail(boardId);
  }

  @ApiResponse({ type: String })
  @Delete(':boardId')
  @UseGuards(AccessAuthenticationGuard)
  async boardDelete(@Param('boardId') boardId: number) {
      return await this.boardService.deleteByboardId(boardId)
  }
}
