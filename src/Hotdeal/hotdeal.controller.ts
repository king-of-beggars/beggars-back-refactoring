import { 
    Controller, 
    Post, 
    Delete, 
    UseGuards, 
    Param, 
    Body, 
    Req ,
    Get, 
    Injectable, 
    UseInterceptors, 
    UploadedFile,
    ParseFilePipe,
    FileTypeValidator,
    HttpCode,
    Res
} from "@nestjs/common";
import { Express, Response } from 'express';
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { HotdealService } from "./hotdeal.service";
import { AccessAuthenticationGuard } from "src/Users/passport/jwt/access.guard";
import { Code, DataSource } from "typeorm";
import { HotdealApplyDto } from "./dto/hotdealApply.dto";
import { HotdealByIdDto } from "./dto/hotdealById.dto";
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';
import { FileInterceptor } from "@nestjs/platform-express";
import { HotdealAddDto } from "./dto/hotdealAdd.dto";
import { ApiConsumes } from "@nestjs/swagger";
import { LockService } from "src/Utils/lock.service";
import { QueueService } from "src/Utils/queue.service";

@ApiTags('핫딜 API')
@Controller('api/hotdeal')
export class HotdealController {
    constructor(
        private hotdealService : HotdealService,
        private readonly lockService : LockService
    ){} 

    @Post(':hotDealId')
    @UseGuards(AccessAuthenticationGuard)
    @HttpCode(201)
    @ApiOperation({
        summary : '핫딜 등록'
    })
    async hotdealApply(hotdealApplyDto : HotdealApplyDto) {
        const lockKey = `hotdeal_lock_${hotdealApplyDto.hotdealId}`
            const inventory = await this.hotdealService.readInventory(hotdealApplyDto.hotdealId)

            if(!inventory) {
                throw new HttpException('재고 소진', HttpStatus.BAD_REQUEST)
            }

            const lock = await this.lockService.setLock(lockKey,20,10)
            if(lock) {
                const inven = this.hotdealService.updateInventory(hotdealApplyDto.hotdealId,-1)
                const regist = this.hotdealService.registWinner(hotdealApplyDto)
                await Promise.all([inven,regist])
                return `신청이 완료됐습니다`
            } else {
                return '신청에 실패했습니다'
            }
       
    }

    
    @Post('/')
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({
        summary : '핫딜 추가(관리자)'
    })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @HttpCode(201)
    async hotdealAdd(
        @Req() req : any,  
        @Body() hotdealAddDto : HotdealAddDto,
        @UploadedFile(  
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: '.(png|jpeg|jpg|svg)' }),
            ],
            fileIsRequired: false,
            }),
        )
        file : Express.Multer.File,
        @Res() res: Response,
    ) { 
        try {
            // const { user } = req
            // if(user.userAuth!==1) {
            //     throw new HttpException('관리자가 아닙니다', HttpStatus.BAD_REQUEST)
            // }
            console.log(file)
            const { location } = file;
            hotdealAddDto.hotdealImg = location
            await this.hotdealService.addHotdeal(hotdealAddDto)
            return '핫딜 등록이 완료됐습니다'
        } catch(e) {
            throw new HttpException(e.message,HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }

    @Get('/')
    @ApiOperation({
        summary : '핫딜 리스트'
    })
    async hotdealList() {
            return await this.hotdealService.getHotdealList()
    }

    @Delete('/')
    @UseGuards(AccessAuthenticationGuard)
    @ApiOperation({
        summary : '핫딜 삭제'
    })
    async hotdealDelete(@Req() req : any, hotdealId : number ) {
            const { user } = req
            if(user.userAuth!==1) {
                throw new HttpException('관리자가 아닌 유저가 접근했습니다', HttpStatus.BAD_REQUEST)
            }
            await this.hotdealService.hotdealDelete(hotdealId)
            return '삭제완료'
    }


}