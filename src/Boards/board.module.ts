import { Module, Controller } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/Users/user.entity';
import { Board } from 'src/Boards/entity/board.entity';
import { Comment } from 'src/Comments/entity/comment.entity';
import { PassportModule } from '@nestjs/passport';
import { BoardController } from 'src/Boards/board.controller';
import { BoardService } from 'src/Boards/board.service';
import { UserModule } from 'src/Users/user.module';
import { CashbookModule } from 'src/Cashlists/cashbook.module';
import { Cashbook } from 'src/Cashlists/entity/cashbook.entity';
import { CashDetail } from 'src/Cashlists/entity/cashDetail.entity';
import { CommentService } from 'src/Comments/comment.service';
import { Like } from 'src/Comments/entity/like.entity';
import { AuthService } from 'src/Users/service/oauth2.service';
import { BoardRepository } from './board.repository';
import { UserRepository } from 'src/Users/user.repository';
import { CashbookRepository } from 'src/Cashlists/repository/cashbook.repsitory';
import { UserService } from 'src/Users/service/user.service';
import { LikeRepository } from 'src/Comments/like.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Board,
      Comment,
      Cashbook,
      CashDetail,
      Like,
    ]),
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository, UserRepository, CashbookRepository, UserService, CommentService, LikeRepository, JwtService],
  exports: [BoardRepository], 
}) 
export class BoardModule {}
