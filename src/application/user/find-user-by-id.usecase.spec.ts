import { Test, TestingModule } from '@nestjs/testing';
import { fakerPT_BR } from '@faker-js/faker/.';
import { FindUserUseCase } from './find-user.usecase';
import { DatabaseErrors } from '../../domain/types/database/database-errors.enum';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { UserModel } from '../../domain/model/user.model';
import { ErrorCode } from '../../domain/types/application/error-code.enum';

class DBError extends Error {
  constructor(public readonly code: DatabaseErrors) {
    super();
  }
}

const userRepositoryMock = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
};

const loggerServiceMock = {
  warn: jest.fn(),
  error: jest.fn(),
};

describe(FindUserUseCase.name, () => {
  let findUserUseCase: FindUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FindUserUseCase,
          inject: [UserRepository, LoggerService],
          useFactory: (
            userRepository: IUserRepository,
            loggerService: ILoggerService,
          ) => new FindUserUseCase(userRepository, loggerService),
        },
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    findUserUseCase = app.get<FindUserUseCase>(FindUserUseCase);
    userRepository = app.get(UserRepository);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(findUserUseCase).toBeDefined();
  });

  describe('By ID', () => {
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    describe('success', () => {
      const user: UserModel = {
        id: userId,
        firstname: fakerPT_BR.person.firstName(),
        lastname: fakerPT_BR.person.lastName(),
        email: fakerPT_BR.internet.email(),
        password: fakerPT_BR.internet.password(),
        createdAt: fakerPT_BR.date.anytime(),
        updatedAt: fakerPT_BR.date.anytime(),
        deletedAt: null,
      };

      beforeAll(() => {
        userRepository.findById.mockResolvedValueOnce(user);
      });

      it('should find a user by id', async () => {
        const result = await findUserUseCase.byId(userId);

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toEqual(user);
        expect(userRepository.findById).toHaveBeenCalledWith<[UserModel['id']]>(
          userId,
        );
      });
    });

    describe('failure', () => {
      describe('NotFound', () => {
        beforeAll(() => {
          userRepository.findById.mockImplementationOnce(() => {
            throw new DBError(DatabaseErrors.NOT_FOUND);
          });
        });

        it('should return a not found error', async () => {
          const result = await findUserUseCase.byId(userId);

          expect(result).not.toHaveProperty('value');
          expect(result).toHaveProperty('error');
          expect(result.error?.code).toBe(ErrorCode.USER_NOT_FOUND);
          expect(loggerService.warn).toHaveBeenCalledWith<[string, string]>(
            FindUserUseCase.name,
            `User [${userId}] could not be found.`,
          );
        });
      });

      describe('Unexpected', () => {
        beforeAll(() => {
          userRepository.findById.mockImplementationOnce(() => {
            throw new DBError(DatabaseErrors.UNEXPECTED);
          });
        });

        it('should return a unexpected error', async () => {
          const result = await findUserUseCase.byId(userId);

          expect(result).not.toHaveProperty('value');
          expect(result).toHaveProperty('error');
          expect(result.error?.code).toBe(ErrorCode.UNEXPECTED);

          const log = {
            message: 'Unexpected error occurred!',
            error: new DBError(DatabaseErrors.UNEXPECTED),
          };

          expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
            FindUserUseCase.name,
            JSON.stringify(log),
          );
        });
      });
    });
  });

  describe('By Email', () => {
    const email: string = fakerPT_BR.internet.email();

    describe('success', () => {
      const user: UserModel = {
        id: fakerPT_BR.string.uuid(),
        firstname: fakerPT_BR.person.firstName(),
        lastname: fakerPT_BR.person.lastName(),
        email,
        password: fakerPT_BR.internet.password(),
        createdAt: fakerPT_BR.date.anytime(),
        updatedAt: fakerPT_BR.date.anytime(),
        deletedAt: null,
      };

      beforeAll(() => {
        userRepository.findByEmail.mockResolvedValueOnce(user);
      });

      it('should find a user by email', async () => {
        const result = await findUserUseCase.byEmail(email);

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value!).toBe(user);
        expect(userRepository.findByEmail).toHaveBeenCalledWith<[string]>(
          email,
        );
      });
    });

    describe('failure', () => {
      describe('NotFound', () => {
        const log = `User [${email}] could not be found.`;

        beforeAll(() => {
          userRepository.findByEmail.mockResolvedValueOnce(null);
        });

        it('should throw an NotFoundException', async () => {
          const result = await findUserUseCase.byEmail(email);

          expect(result).toHaveProperty('error');
          expect(result).not.toHaveProperty('value');
          expect(result.error!.code).toBe(ErrorCode.USER_NOT_FOUND);
          expect(loggerService.warn).toHaveBeenCalledWith<[string, string]>(
            FindUserUseCase.name,
            log,
          );
        });
      });
    });
  });
});
