import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import {
  TransactionType,
  TransactionStatus,
  Region,
  Category,
} from '../enums/transaction.enum';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
  ) {}

  async isDatabaseEmpty(): Promise<boolean> {
    const count = await this.transactionsRepository.count();
    return count === 0;
  }

  async seed() {
    // Clear existing data
    await this.transactionsRepository.clear();
    console.log('Database cleared');

    const startDate = new Date('2022-01-01');
    const endDate = new Date('2024-11-30');
    const transactions = [];

    // Generate one transaction per day
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      // Generate 2-3 transactions per day
      const transactionsPerDay = Math.floor(Math.random() * 2) + 2;

      for (let i = 0; i < transactionsPerDay; i++) {
        const type =
          Math.random() > 0.5
            ? TransactionType.SALES
            : TransactionType.EXPENSES;

        // Generate amount based on transaction type (in whole numbers)
        let amount;
        if (type === TransactionType.SALES) {
          amount = Math.floor(Math.random() * 199000) + 1000; // Sales: 1000-200000
        } else {
          amount = Math.floor(Math.random() * 20000) + 1000; // Expenses: 1000-21000
        }

        const status =
          Math.random() > 0.1
            ? TransactionStatus.COMPLETED
            : TransactionStatus.PENDING;

        // Select random region with weighted distribution
        const regions = Object.values(Region);
        const regionWeights = [0.3, 0.15, 0.25, 0.15, 0.1, 0.05]; // Weights for each region
        const randomRegionIndex = this.weightedRandom(regionWeights);
        const region = regions[randomRegionIndex];

        // Select random category with type-based weighting
        const categories = Object.values(Category);
        let categoryWeights;
        if (type === TransactionType.SALES) {
          categoryWeights = [0.2, 0.5, 0.3]; // HR, Marketing, Operations weights for sales
        } else {
          categoryWeights = [0.4, 0.3, 0.3]; // HR, Marketing, Operations weights for expenses
        }
        const randomCategoryIndex = this.weightedRandom(categoryWeights);
        const category = categories[randomCategoryIndex];

        // Create transaction with random time during the day
        const transactionDate = new Date(date);
        transactionDate.setHours(Math.floor(Math.random() * 24));
        transactionDate.setMinutes(Math.floor(Math.random() * 60));

        transactions.push({
          date: transactionDate,
          amount,
          type,
          status,
          region,
          category,
        });
      }
    }

    // Save all transactions in chunks to avoid memory issues
    const chunkSize = 100;
    for (let i = 0; i < transactions.length; i += chunkSize) {
      const chunk = transactions.slice(i, i + chunkSize);
      await this.transactionsRepository.save(chunk);
      console.log(
        `Saved transactions ${i + 1} to ${Math.min(i + chunkSize, transactions.length)}`,
      );
    }

    const finalCount = await this.transactionsRepository.count();
    console.log(`Seeded ${finalCount} transactions`);
  }

  private weightedRandom(weights: number[]): number {
    const random = Math.random();
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random < sum) return i;
    }
    return weights.length - 1;
  }
}
