import { Test, TestingModule } from '@nestjs/testing';
import { SeederService } from '../services/seeder.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionType } from '../enums/transaction.enum';

describe('SeederService', () => {
  let service: SeederService;
  let repository: Repository<Transaction>;

  const mockRepository = {
    clear: jest.fn().mockResolvedValue(undefined),
    save: jest.fn().mockImplementation((transactions: Partial<Transaction>[]) =>
      Promise.resolve(
        transactions.map((t) => ({
          id: 1,
          date: new Date(),
          ...t,
        })),
      ),
    ),
    count: jest.fn().mockResolvedValue(2000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SeederService>(SeederService);
    repository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seed', () => {
    it('should clear and seed the database', async () => {
      await service.seed();

      expect(repository.clear).toHaveBeenCalled();
      expect(repository.save).toHaveBeenCalled();
      expect(repository.count).toHaveBeenCalled();
    });

    it('should generate transactions within specified date range', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await service.seed();

      const savedCalls = saveSpy.mock.calls as Partial<Transaction>[][];
      const savedTransactions = savedCalls.flat() as Partial<Transaction>[];
      const dates = savedTransactions
        .filter((t) => t.date instanceof Date)
        .map((t) => t.date as Date);

      const startDate = new Date('2022-01-01');
      const endDate = new Date('2024-11-30');

      dates.forEach((date) => {
        expect(date >= startDate && date <= endDate).toBeTruthy();
      });
    });

    it('should generate valid amounts based on transaction type', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await service.seed();

      const savedCalls = saveSpy.mock.calls as Partial<Transaction>[][];
      const savedTransactions = savedCalls.flat() as Partial<Transaction>[];

      savedTransactions.forEach((transaction) => {
        if (transaction.type === TransactionType.SALES) {
          expect(transaction.amount).toBeGreaterThanOrEqual(1000);
          expect(transaction.amount).toBeLessThanOrEqual(200000);
        } else if (transaction.amount) {
          expect(transaction.amount).toBeGreaterThanOrEqual(1000);
          expect(transaction.amount).toBeLessThanOrEqual(21000);
        }
      });
    });

    it('should save transactions in chunks', async () => {
      const saveSpy = jest.spyOn(repository, 'save');

      await service.seed();

      const savedCalls = saveSpy.mock.calls as Partial<Transaction>[][];
      savedCalls.forEach((transactions) => {
        expect(transactions.length).toBeLessThanOrEqual(100);
      });
    });
  });
});
