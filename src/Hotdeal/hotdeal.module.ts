import { HotdealController } from "./hotdeal.controller";
import { HotdealService } from "./hotdeal.service";
import { Hotdeal } from "./hotdeal.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { PassportModule } from "@nestjs/passport";
import { MulterModule } from "@nestjs/platform-express";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterConfigService } from "src/Utils/multer.config";
import { HotdealWiner } from "./hotdealWinner.entity";
import { HotdealRepository } from "./hotdeal.repository";
import { LockService } from "src/Utils/lock.service";

@Module({
    imports: [
      TypeOrmModule.forFeature([
        Hotdeal,
        HotdealWiner
      ]),
      PassportModule,
      MulterModule.registerAsync({
            imports: [ConfigModule],
            useClass: MulterConfigService,
            inject: [ConfigService],
        })
      
    ],
    controllers: [HotdealController],
    providers: [HotdealService, HotdealRepository, LockService],
    exports: [HotdealService, HotdealRepository],
  })
  export class HotdealModule {}