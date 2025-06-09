import { Test, TestingModule } from '@nestjs/testing';
import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { UpdateUserUseCase } from './update-user.usecase';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { UserModel } from '../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker';
import { DatabaseErrors } from '../../domain/types/database/database-errors.enum';
import { ErrorCode } from '../../domain/types/application/error-code.enum';

class DBError extends Error {
  constructor(public readonly code: DatabaseErrors) {
    super();
  }
}

const userRepositoryMock = {
  update: jest.fn(),
};

const loggerServiceMock = {
  log: jest.fn(),
  error: jest.fn(),
};

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateUserUseCase,
          inject: [UserRepository, LoggerService],
          useFactory: (
            userRepository: IUserRepository,
            loggerService: ILoggerService,
          ) => new UpdateUserUseCase(userRepository, loggerService),
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

    updateUserUseCase = app.get<UpdateUserUseCase>(UpdateUserUseCase);
    userRepository = app.get(UserRepository);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(loggerService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(updateUserUseCase).toBeDefined();
  });

  describe('run', () => {
    const userId: UserModel['id'] = fakerPT_BR.string.uuid();

    const user: UserModel = {
      id: userId,
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.lastName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 12 }),
      createdAt: fakerPT_BR.date.anytime(),
      updatedAt: fakerPT_BR.date.anytime(),
      deletedAt: null,
    };

    describe('success', () => {
      beforeAll(() => {
        userRepository.update.mockResolvedValueOnce(user);
      });

      it('should update a user by id', async () => {
        const result = await updateUserUseCase.run(userId, user);

        expect(result).not.toHaveProperty('error');
        expect(result).toHaveProperty('value');
        expect(result.value).toBe(user);
        expect(userRepository.update).toHaveBeenCalledWith<[string, UserModel]>(
          userId,
          user,
        );
        expect(loggerService.log).toHaveBeenCalledWith<[string, string]>(
          UpdateUserUseCase.name,
          `User [%${userId}] updated`,
        );
      });
    });

    describe('failure', () => {
      beforeAll(() => {
        userRepository.update.mockImplementationOnce(() => {
          throw new DBError(DatabaseErrors.NOT_FOUND);
        });
      });

      it('should throw an error', async () => {
        const result = await updateUserUseCase.run(userId, user);

        expect(result).not.toHaveProperty('value');
        expect(result).toHaveProperty('error');
        expect(result.error?.code).toBe(ErrorCode.USER_UPDATE);

        const log = {
          message: `Could not update user [${userId}]`,
          error: new DBError(DatabaseErrors.NOT_FOUND),
        };

        expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
          UpdateUserUseCase.name,
          JSON.stringify(log),
        );
      });
    });
  });
});
