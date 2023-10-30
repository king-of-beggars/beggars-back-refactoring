import { PickType } from '@nestjs/swagger';
import { CashDetailDto } from './cashbook.dto';

export class ValueUpdateDto extends PickType(CashDetailDto, [
  'cashDetailValue',
]) {
    cashbookId : number
}
