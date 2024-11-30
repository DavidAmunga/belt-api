import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from '../transactions.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionType, TransactionStatus, Region, Category } from '../enums/transaction.enum';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let repository: Repository<Transaction>;

  const mockTransaction = {
    id: 1,
    date: new Date(),
    amount: 50000,
    type: TransactionType.SALES,
    status: TransactionStatus.COMPLETED,
    region: Region.NORTH_AMERICA,
    category: Category.MARKETING,
  };

  const mockRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(transaction => 
      Promise.resolve({ id: 1, ...transaction })),
    findOneBy: jest.fn().mockImplementation(({ id }) => 
      Promise.resolve(id === 1 ? mockTransaction : null)),
    update: jest.fn().mockImplementation(() => Promise.resolve()),
    remove: jest.fn().mockImplementation(transaction => Promise.resolve(transaction)),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockTransaction], 1]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    repository = module.get<Repository<Transaction>>(getRepositoryToken(Transaction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const createDto = {
        amount: 50000,
        type: TransactionType.SALES,
        status: TransactionStatus.COMPLETED,
        region: Region.NORTH_AMERICA,
        category: Category.MARKETING,
      };

      const result = await service.create(createDto);
      expect(result).toEqual({ id: 1, ...createDto });
      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions with filters', async () => {
      const query = {
        page: 1,
        limit: 10,
        type: TransactionType.SALES,
        status: TransactionStatus.COMPLETED,
        region: Region.NORTH_AMERICA,
        category: Category.MARKETING,
      };

      const result = await service.findAll(query);
      expect(result).toEqual({
        items: [mockTransaction],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should handle search parameter', async () => {
      const query = {
        search: '50000',
        page: 1,
        limit: 10,
      };

      const result = await service.findAll(query);
      expect(result.items).toHaveLength(1);
      expect(repository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockTransaction);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return null for non-existent transaction', async () => {
      const result = await service.findOne(999);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const updateDto = {
        amount: 60000,
        status: TransactionStatus.PENDING,
      };

      await service.update(1, updateDto);
      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('remove', () => {
    it('should remove a transaction', async () => {
      const result = await service.remove(1);
      expect(result).toEqual(mockTransaction);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.remove).toHaveBeenCalledWith(mockTransaction);
    });

    it('should return null if transaction not found', async () => {
      const result = await service.remove(999);
      expect(result).toBeNull();
    });
  });
}); 