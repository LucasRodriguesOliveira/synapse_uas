import { Test, TestingModule } from '@nestjs/testing';
import { ICryptoService } from '../../domain/auth/crypto/crypto.interface';
import { IJwtService } from '../../domain/auth/jwt/jwt.interface';
import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { LoginUseCase } from './login.usecase';
import { BcryptService } from '../../infrastructure/service/bcrypt/bcrypt.service';
import { JwtTokenService } from '../../infrastructure/service/jwt/jwt.service';
import { LoggerService } from '../../infrastructure/logger/logger.service';
import { fakerPT_BR } from '@faker-js/faker/.';
import { UserModel } from '../../domain/model/user.model';
import { JwtPayload } from '../../domain/auth/jwt/jwt-payload.interface';
import { ErrorCode } from '../../domain/types/application/error-code.enum';
import { FindUserUseCase } from '../user/find-user.usecase';

const findUserUseCaseMock = {
  byEmail: jest.fn(),
};

const cryptoServiceMock = {
  compare: jest.fn(),
};

const jwtServiceMock = {
  createToken: jest.fn(),
};

const loggerServiceMock = {
  warn: jest.fn(),
};

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let findUserUseCase: jest.Mocked<FindUserUseCase>;
  let cryptoService: jest.Mocked<ICryptoService>;
  let jwtService: jest.Mocked<IJwtService>;
  let loggerService: jest.Mocked<ILoggerService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoginUseCase,
          useFactory: (
            findUserByEmailUseCase,
            cryptoService,
            jwtService,
            loggerService,
          ) =>
            new LoginUseCase(
              findUserByEmailUseCase,
              cryptoService,
              jwtService,
              loggerService,
            ),
          inject: [
            FindUserUseCase,
            BcryptService,
            JwtTokenService,
            LoggerService,
          ],
        },
        {
          provide: FindUserUseCase,
          useValue: findUserUseCaseMock,
        },
        {
          provide: BcryptService,
          useValue: cryptoServiceMock,
        },
        {
          provide: JwtTokenService,
          useValue: jwtServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    loginUseCase = app.get<LoginUseCase>(LoginUseCase);
    findUserUseCase = app.get(FindUserUseCase);
    cryptoService = app.get(BcryptService);
    jwtService = app.get(JwtTokenService);
    loggerService = app.get(LoggerService);
  });

  it('should be defined', () => {
    expect(findUserUseCase).toBeDefined();
    expect(cryptoService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(loggerService).toBeDefined();
    expect(loginUseCase).toBeDefined();
  });

  const user: UserModel = {
    id: fakerPT_BR.string.uuid(),
    firstname: fakerPT_BR.person.firstName(),
    lastname: fakerPT_BR.person.lastName(),
    email: fakerPT_BR.internet.email(),
    password: fakerPT_BR.internet.password(),
    createdAt: fakerPT_BR.date.anytime(),
    updatedAt: fakerPT_BR.date.anytime(),
    deletedAt: null,
  };

  describe('checkUser', () => {
    const { email, password } = user;

    beforeEach(() => {
      findUserUseCase.byEmail.mockResolvedValueOnce({ value: user });
    });

    describe('correct password', () => {
      beforeAll(() => {
        cryptoService.compare.mockResolvedValueOnce(true);
      });

      it('should authorize user to login', async () => {
        const result = await loginUseCase.checkUser(email, password);

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toEqual(user);
        expect(findUserUseCase.byEmail).toHaveBeenCalledWith<[string]>(email);
        expect(cryptoService.compare).toHaveBeenCalledWith<[string, string]>(
          password,
          user.password,
        );
        expect(loggerService.warn).not.toHaveBeenCalled();
      });
    });

    describe('wrong password', () => {
      const wrongPassword = fakerPT_BR.internet.password();

      beforeAll(() => {
        cryptoService.compare.mockResolvedValueOnce(false);
        user.password = wrongPassword;
      });

      afterAll(() => {
        user.password = password;
      });

      it('should not authorize user to login', async () => {
        const result = await loginUseCase.checkUser(email, password);

        expect(result).toHaveProperty('error');
        expect(result).not.toHaveProperty('value');
        expect(result.error?.code).toBe(ErrorCode.WRONG_PASSWORD);
        expect(findUserUseCase.byEmail).toHaveBeenCalledWith<[string]>(email);
        expect(cryptoService.compare).toHaveBeenCalledWith<[string, string]>(
          password,
          wrongPassword,
        );

        const log = {
          code: ErrorCode.WRONG_PASSWORD,
          message: `User [${email}] tried: ${password}`,
        };

        expect(loggerService.warn).toHaveBeenCalledWith<[string, string]>(
          LoginUseCase.name,
          JSON.stringify(log),
        );
      });
    });
  });

  describe('login', () => {
    const expectedToken = fakerPT_BR.internet.jwt();

    beforeAll(() => {
      jwtService.createToken.mockResolvedValueOnce(expectedToken);
    });

    it('should create a jwt token for a given user', async () => {
      const result = await loginUseCase.login(user);

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
      };

      expect(result).toEqual(expectedToken);
      expect(jwtService.createToken).toHaveBeenCalledWith<[JwtPayload]>(
        payload,
      );
    });
  });
});
