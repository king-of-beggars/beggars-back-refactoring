import { Module, Controller } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/Users/user.entity';
import { PassportModule } from '@nestjs/passport';
import { BoardController } from 'src/Boards/board.controller';
import { BoardService } from 'src/Boards/board.service';
import { CashList } from './entity/cashList.entity';
import { CashDetail } from './entity/cashDetail.entity';
import { CashbookService } from './cashbook.service';
import { CashbookContoller } from './cashbook.controller';
import { Cashbook } from './entity/cashbook.entity';
import { UserService } from 'src/Users/service/user.service';
import { AutoCreateService } from './autocreate.service';
import { ScheduleModule } from '@nestjs/schedule';
import { Board } from 'src/Boards/entity/board.entity';
import { CashbookRepository } from './repository/cashbook.repsitory';
import { CashDetailRepository } from './repository/cashDetail.repository';
import { CashListRepository } from './repository/cashList.repository';
import { BoardRepository } from 'src/Boards/board.repository';
import { BoardModule } from 'src/Boards/board.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      CashList,
      CashDetail,
      Cashbook,
      Board,
    ]),
    PassportModule,
    ScheduleModule.forRoot()
  ],
  controllers: [CashbookContoller],
  providers: [CashbookService, AutoCreateService, CashbookRepository, CashDetailRepository, CashListRepository, BoardRepository, JwtService, UserService],
  exports: [CashbookRepository, CashDetailRepository, CashListRepository],
})
export class CashbookModule {}
