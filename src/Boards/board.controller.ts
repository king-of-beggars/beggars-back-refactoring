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
import { PostBoardDto } from './dto/postBoard.dto';
import { PaginationDto } from './dto/pagination.dto';
import {
  ApiQuery,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { BoardResDto } from './dto/boardRes.dto';
import { BoardDetailResDto } from './dto/boarDetailRes.dto'

@Controller('api/board')
@ApiTags('게시물 API')
export class BoardController {
  constructor(
    private readonly boardService: BoardService
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
