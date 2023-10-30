import { Controller,Post,Req, Body, HttpCode, UseGuards, Get, Query, Delete, Param, Put, ConsoleLogger, UseFilters} from '@nestjs/common';
import { CashbookService } from './cashbook.service';
import { PostDetailDto } from './dto/postDetail.dto';
import { Cashbook } from './entity/cashbook.entity';
import { AccessAuthenticationGuard } from 'src/Users/passport/jwt/access.guard';
import { UserService } from 'src/Users/service/user.service';
import { ValueUpdateDto } from './dto/valueUpdate.dto';
import { FrameDto } from './dto/frame.dto';
//import * as moment from 'moment-timezone';
const moment = require('moment-timezone')
import { DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { GetCategory } from './dto/getCategory.dto';
import { BoardService } from 'src/Boards/board.service';
import { MainPageDto } from './dto/mainPageRes.dto';
import { ByDateResDto } from './dto/byDateRes.dto';
import { DetailResDto } from './dto/detailRes.dto';
import { CashList } from './entity/cashList.entity';
import { GetByCashbookIdDto } from './dto/getByCashbookId.dto';
import { GetByCashDetailIdDto } from './dto/getByCashDetailId.dto';
import { PaginationDto } from 'src/Boards/dto/pagination.dto';
import { QueryDate } from './dto/queryDate.dto';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { CashbookCreateDto } from './dto/cashbookCreate.dto';

@Controller('api/cashbook')
@ApiTags('가계부 관련 API')
export class CashbookContoller {
    constructor(
        private readonly cashbookService : CashbookService,
        private readonly userService : UserService
    ){}

    @Get('/main')
    @HttpCode(200)
    @UseGuards(AccessAuthenticationGuard)
    @ApiResponse({type: MainPageDto, description : 'data 객체 내부에 생성' })
    @ApiOperation({ summary: '메인 api', description: '몇일째 되는 날, 2주치 데이터, 당일 유저 지출 총합, 섹션별 소비' })
    async mainPage(@Req() req : any) {
            const { user } = req
            //1. 몇 일 째 되는 날

            const promises = [
                this.userService.userSignupDate(user.userId),
                this.cashbookService.getCashbookDuringDate(user.userId),
                this.cashbookService.getCashbookGroupByCate(user.userId)
            ]

            const [signupDay, twoweek, groupByCategory] = await Promise.all(promises);
            
            //4. 유저 토탈 소비 합
            const total = await this.cashbookService.totalValue(groupByCategory)
  
            let mainPageDto : MainPageDto= {
                signupDay,
                twoweek,
                groupByCategory,
                total
            }
            return {
                data : mainPageDto
            }
    }

 
    @Post('frame')
    @HttpCode(201)
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({ summary: '프레임 생성', description: '프레임 생성 및 가계부 섹션 오늘치 생성' })
    @ApiBody({type:FrameDto})
    async cashFrameCreate (@Body() frameDto : FrameDto, @Req() req : any) {
            const { user } = req
            frameDto.userId = user.userId
            //프레임 생성
            const query = await this.cashbookService.createFrame(frameDto)
            return query
    }

    //카태고리 수정
    //당일 날짜의 cashbook과 cashlist를 수정
    @Put('frame/:cashbookId')
    @HttpCode(200)
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({ summary: '프레임 수정', description: '프레임 수정 및 캐시북 아이디 값에 맞는 캐시북 수정' })
    @ApiBody({type:FrameDto})
    async cashFrameUpdate(@Param() getByCashbookIdDto : GetByCashbookIdDto, @Body() frameDto: FrameDto, @Req() req: any) {
        const { user } = req
        frameDto.userId = user.userId
        await this.cashbookService.frameUpdate(getByCashbookIdDto, frameDto)
        return '프레임 수정 완료';
    }

    //딜리트
    @Delete('frame/:cashbookId')
    @HttpCode(200)
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({ summary: '프레임 삭제', description: '프레임 삭제 및 부모 row 전부 삭제' })
    async frameDelete(@Param() cashbookId : GetByCashbookIdDto) {
            await this.cashbookService.frameDelete(cashbookId)
            return '프레임 삭제 완료'
    }   

    //디폴트는 오늘로 전달해주시길 프론트엔드 2023-05-24 형식으로
    @Get('/')
    @UseGuards(AccessAuthenticationGuard)
    @ApiResponse({type:[ByDateResDto], description : 'data 객체 내부에 생성'})
    @ApiOperation({ summary: '특정 날짜 가계부 get', description: '2022-04-05 형식으로 쿼리스트링 하여 request 요구' })
    async cashList(@Query('date') date : QueryDate, @Req() req : any) {
            const regex = /\d{4}-\d{2}-\d{2}/; 
            if(!regex.test(date.date.toString())) {
            throw new HttpException('날짜 형식 에러', HttpStatus.BAD_REQUEST)      
        }
            const { user } = req
            let result : any = await this.cashbookService.getCashbookByDate(date,user.userId)
            return {
                result
            }
        
    }

    @Get(':cashbookId')
    @UseGuards(AccessAuthenticationGuard)
    @ApiResponse({type:DetailResDto, description : 'data 객체 내부에 생성'})
    @ApiOperation({ summary: '특정 카드의 디테일 정보', description: '카드이름, 카드카테고리, 디테일정보// 무지출 consumption : false' })
    async cashDetail(@Param('cashbookId') cashbookId : number) {
            return await this.cashbookService.getDetail(cashbookId)
    }
 
    @Post(":cashbookId")
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({ summary: '디테일 정보 입력', description: 'cashbookId, text, value 입력' })
    @ApiBody({type:PostDetailDto})
    async postDetail(@Param('cashbookId') cashbookId : number, @Body() postDetailDto : PostDetailDto) {
        await this.cashbookService.postDetailService(cashbookId, postDetailDto)
        return {
            'message' : '입력이 완료되었습니다'
        }
    }

    @Delete(":cashDetailId")
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({ summary: '디테일 삭제', description: '디테일 삭제 API' })
    async deleteDetail(@Param('cashDetailId') cashDetailId : number) {
            return await this.cashbookService.deleteDetail(cashDetailId)
    }

    @Put(":cashbookId")
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({ summary: '무지출 전환 API', description: '무지출 전환시 DB데이터 NULL, 활성화 시 0' })
    async checkConsume(@Param('cashbookId') cashbookId : number) {
            await this.cashbookService.inputConsumer(cashbookId)
            return '무지출 지출 전환 완료'
    } 
}