import { CreateUserUseCase } from './create-user.usecase';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { ICryptoService } from '../../domain/auth/crypto/crypto.interface';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from '../../infrastructure/repository/user.repository';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { BcryptService } from '../../infrastructure/service/bcrypt/bcrypt.service';
import { fakerPT_BR } from '@faker-js/faker';
import { UserModel } from '../../domain/model/user.model';
import { ErrorCode } from '../../domain/types/application/error-code.enum';

const userRepositoryMock = {
  create: jest.fn(),
};

const loggerServiceMock = {
  log: jest.fn(),
  error: jest.fn(),
};

const cryptoServiceMock = {
  hash: jest.fn(),
};

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let loggerService: jest.Mocked<ILoggerService>;
  let cryptoService: jest.Mocked<ICryptoService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateUserUseCase,
          inject: [UserRepository, LoggerService, BcryptService],
          useFactory: (
            userRepository: IUserRepository,
            loggerService: ILoggerService,
            cryptoService: ICryptoService,
          ) =>
            new CreateUserUseCase(userRepository, loggerService, cryptoService),
        },
        {
          provide: UserRepository,
          useValue: userRepositoryMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
        {
          provide: BcryptService,
          useValue: cryptoServiceMock,
        },
      ],
    }).compile();

    createUserUseCase = app.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = app.get(UserRepository);
    loggerService = app.get(LoggerService);
    cryptoService = app.get(BcryptService);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(cryptoService).toBeDefined();
    expect(createUserUseCase).toBeDefined();
  });

  describe('run', () => {
    describe('success', () => {
      const oldPassword = fakerPT_BR.internet.password({ length: 10 });
      const hashedPassword = fakerPT_BR.internet.password({ length: 20 });

      const userData: Partial<UserModel> = {
        firstname: fakerPT_BR.person.firstName(),
        lastname: fakerPT_BR.person.lastName(),
        email: fakerPT_BR.internet.email(),
        password: `${oldPassword}`,
      };

      const user: UserModel = {
        id: fakerPT_BR.string.uuid(),
        firstname: userData.firstname!,
        lastname: userData.lastname!,
        email: userData.email!,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const log = {
        message: `User [${user.id}] created!`,
        params: { ...userData, password: hashedPassword },
        result: user,
      };

      beforeAll(() => {
        cryptoService.hash.mockResolvedValueOnce(hashedPassword);
        userRepository.create.mockResolvedValueOnce(user);
      });

      it('should create a user successfully', async () => {
        const result = await createUserUseCase.run({ ...userData });

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toEqual(user);
        expect(cryptoService.hash).toHaveBeenCalledWith<[string]>(
          userData.password!,
        );
        expect(userRepository.create).toHaveBeenCalledWith<
          [Partial<UserModel>]
        >({ ...userData, password: hashedPassword });
        expect(loggerService.log).toHaveBeenCalledWith<[string, string]>(
          CreateUserUseCase.name,
          JSON.stringify(log),
        );
      });
    });

    describe('failure', () => {
      const userData: Partial<UserModel> = {
        firstname: fakerPT_BR.person.firstName(),
        lastname: fakerPT_BR.person.lastName(),
        email: fakerPT_BR.internet.email(),
        password: fakerPT_BR.internet.password({ length: 10 }),
      };

      const user: UserModel = {
        id: fakerPT_BR.string.uuid(),
        firstname: userData.firstname!,
        lastname: userData.lastname!,
        email: userData.email!,
        // already encrypted by cryptoService
        password: fakerPT_BR.internet.password({ length: 20 }),
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const log = {
        message: `User could not be created`,
        params: { ...userData, password: user.password },
        error: new Error(),
      };

      beforeAll(() => {
        cryptoService.hash.mockClear();
        cryptoService.hash.mockResolvedValueOnce(user.password);
        userRepository.create.mockImplementationOnce(() => {
          throw new Error();
        });
      });

      it('should throw an error', async () => {
        const result = await createUserUseCase.run({ ...userData });

        expect(result).not.toHaveProperty('value');
        expect(result).toHaveProperty('error');
        expect(result.error?.code).toBe(ErrorCode.USER_CREATE);
        expect(cryptoService.hash).toHaveBeenCalledWith<[string]>(
          userData.password!,
        );
        expect(loggerService.error).toHaveBeenCalledWith<[string, string]>(
          CreateUserUseCase.name,
          JSON.stringify(log),
        );
      });
    });
  });
});
