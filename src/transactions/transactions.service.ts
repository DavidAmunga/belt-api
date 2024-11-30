import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  create(createTransactionDto: CreateTransactionDto) {
    const transaction =
      this.transactionsRepository.create(createTransactionDto);
    return this.transactionsRepository.save(transaction);
  }

  async findAll(query: QueryTransactionDto) {
    const {
      search,
      type,
      status,
      region,
      category,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.transactionsRepository.createQueryBuilder('transaction');

    if (search) {
      queryBuilder.where('CAST(transaction.amount as TEXT) LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('transaction.status = :status', { status });
    }

    if (region) {
      queryBuilder.andWhere('transaction.region = :region', { region });
    }

    if (category) {
      queryBuilder.andWhere('transaction.category = :category', { category });
    }

    const [items, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOne(id: number) {
    return this.transactionsRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateTransactionDto: Partial<CreateTransactionDto>,
  ) {
    await this.transactionsRepository.update(id, updateTransactionDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);
    if (transaction) {
      await this.transactionsRepository.remove(transaction);
    }
    return transaction;
  }
}
