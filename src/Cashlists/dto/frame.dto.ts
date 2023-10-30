import { IsNotEmpty, Max } from 'class-validator';
import User from 'src/Users/user.entity';
import { Cashbook } from '../entity/cashbook.entity';
import { PickType } from '@nestjs/swagger';
import { CashListDto } from './cashbook.dto';

export class FrameDto extends PickType(CashListDto, [
  'cashCategory',
  'cashName',
  'cashListGoalValue',
  'userId',
] as const) {}
 