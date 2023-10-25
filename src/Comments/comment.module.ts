import { Module, Controller } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/Users/user.entity';
import { Board } from 'src/Boards/entity/board.entity';
import { Comment } from 'src/Comments/entity/comment.entity';
import { Like } from './entity/like.entity';
import { PassportModule } from '@nestjs/passport';
import { BoardController } from 'src/Boards/board.controller';
import { BoardService } from 'src/Boards/board.service';
import { CommentService } from './comment.service';
import { LikeController } from './like.controller';
import { CommentController } from './comment.controller';
import { UserService } from 'src/Users/service/user.service';
import { AuthService } from 'src/Users/service/oauth2.service';
import { CommentRepository } from './comment.respository';
import { LikeRepository } from './like.repository';
import { UserRepository } from 'src/Users/user.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Board, Comment, Like]),
    PassportModule,
  ],
  controllers: [CommentController, LikeController],
  providers: [CommentService, LikeRepository, CommentRepository, UserRepository], 
  exports: [CommentRepository, LikeRepository],
})
export class CommentModule {}
