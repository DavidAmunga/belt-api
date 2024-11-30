import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import {
  TransactionType,
  TransactionStatus,
  Region,
  Category,
} from '../enums/transaction.enum';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  date: Date;

  @Column('integer')
  amount: number;

  @Column({
    type: 'text',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({
    type: 'text',
    enum: TransactionStatus,
  })
  status: TransactionStatus;

  @Column({
    type: 'text',
    enum: Region,
  })
  region: Region;

  @Column({
    type: 'text',
    enum: Category,
  })
  category: Category;

  // Transform amount to integer before sending response
  toJSON() {
    return {
      ...this,
      amount: Math.floor(this.amount),
    };
  }
}
