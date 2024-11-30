import { IsEnum, IsNumber, Min } from 'class-validator';
import {
  TransactionType,
  TransactionStatus,
  Region,
  Category,
} from '../enums/transaction.enum';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsEnum(TransactionStatus)
  status: TransactionStatus;

  @IsEnum(Region)
  region: Region;

  @IsEnum(Category)
  category: Category;
}
