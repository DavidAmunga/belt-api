import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from '../transactions.controller';
import { TransactionsService } from '../transactions.service';
import { SeederService } from '../services/seeder.service';
import {
  TransactionType,
  TransactionStatus,
  Region,
  Category,
} from '../enums/transaction.enum';
import { CreateTransactionDto } from '../dto/create-transaction.dto';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: TransactionsService;
  let seederService: SeederService;

  const mockTransaction = {
    id: 1,
    date: new Date(),
    amount: 50000,
    type: TransactionType.SALES,
    status: TransactionStatus.COMPLETED,
    region: Region.NORTH_AMERICA,
    category: Category.MARKETING,
  };

  const mockTransactionsService = {
    create: jest.fn((dto) => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn((query) =>
      Promise.resolve({
        items: [mockTransaction],
        total: 1,
        page: query.page || 1,
        totalPages: 1,
      }),
    ),
    findOne: jest.fn((id) =>
      Promise.resolve(id === 1 ? mockTransaction : null),
    ),
    update: jest.fn((id, dto) => Promise.resolve({ id, ...dto })),
    remove: jest.fn((id) => Promise.resolve(id === 1 ? mockTransaction : null)),
  };

  const mockSeederService = {
    seed: jest.fn(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: SeederService,
          useValue: mockSeederService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get<TransactionsService>(TransactionsService);
    seederService = module.get<SeederService>(SeederService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('seed', () => {
    it('should seed the database', async () => {
      const result = await controller.seed();
      expect(result).toEqual({ message: 'Database seeded successfully' });
      expect(seederService.seed).toHaveBeenCalled();
    });
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

      const result = await controller.create(createDto);
      expect(result).toEqual({ id: 1, ...createDto });
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated transactions', async () => {
      const query = {
        page: 1,
        limit: 10,
        type: TransactionType.SALES,
        status: TransactionStatus.COMPLETED,
      };

      const result = await controller.findAll(query);
      expect(result).toEqual({
        items: [mockTransaction],
        total: 1,
        page: 1,
        totalPages: 1,
      });
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle empty query parameters', async () => {
      const result = await controller.findAll({});
      expect(result.items).toHaveLength(1);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a transaction by id', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockTransaction);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null for non-existent transaction', async () => {
      const result = await controller.findOne('999');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const updateDto: Partial<CreateTransactionDto> = {
        amount: 60000,
        status: TransactionStatus.PENDING,
      };

      const result = await controller.update('1', updateDto);
      expect(result).toEqual({ id: 1, ...updateDto });
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a transaction', async () => {
      const result = await controller.remove('1');
      expect(result).toEqual(mockTransaction);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should return null if transaction not found', async () => {
      const result = await controller.remove('999');
      expect(result).toBeNull();
    });
  });
});
