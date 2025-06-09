import { Test, TestingModule } from '@nestjs/testing';
import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { DeleteUserUseCase } from './delete-user.usecase';
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
  deleteById: jest.fn(),
};

const loggerServiceMock = {
  log: jest.fn(),
  error: jest.fn(),
};

describe(DeleteUserUseCase.name, () => {
  let deleteUserUseCase: DeleteUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DeleteUserUseCase,
          inject: [UserRepository, LoggerService],
          useFactory: (
            userRepository: IUserRepository,
            loggerService: ILoggerService,
          ) => new DeleteUserUseCase(userRepository, loggerService),
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

    deleteUserUseCase = app.get<DeleteUserUseCase>(DeleteUserUseCase);
    userRepository = app.get(UserRepository);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(loggerService).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(deleteUserUseCase).toBeDefined();
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
      deletedAt: new Date(),
    };

    describe('success', () => {
      beforeEach(() => {
        userRepository.deleteById.mockResolvedValueOnce(user);
      });

      it('should delete a user by id', async () => {
        const result = await deleteUserUseCase.run(userId);

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toBe(user);
        expect(loggerService.log).toHaveBeenCalledWith<[string, string]>(
          DeleteUserUseCase.name,
          `Soft Delete: user [${userId}]`,
        );
      });
    });

    describe('failure', () => {
      beforeEach(() => {
        userRepository.deleteById.mockImplementationOnce(() => {
          throw new DBError(DatabaseErrors.NOT_FOUND);
        });
      });

      it('should return a error', async () => {
        const result = await deleteUserUseCase.run(userId);

        expect(result).toHaveProperty('error');
        expect(result).not.toHaveProperty('value');
        expect(result.error?.code).toBe(ErrorCode.USER_DELETE);

        const log = {
          message: 'Could not delete user',
          error: new DBError(DatabaseErrors.NOT_FOUND),
        };

        expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
          DeleteUserUseCase.name,
          JSON.stringify(log),
        );
      });
    });
  });
});
