import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { fakerPT_BR } from '@faker-js/faker/.';
import { UserModel } from '../../../domain/model/user.model';
import { LoginUseCase } from '../../../application/auth/login.usecase';
import { CreateUserUseCase } from '../../../application/user/create-user.usecase';
import { LoginProxy } from '../../../infrastructure/proxy/auth/login.proxy';
import { CreateUserProxy } from '../../../infrastructure/proxy/user/create-user.proxy';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthResponse } from './presenter/auth-response.presenter';
import { UserPresenter } from '../user/presenter/user.presenter';

const loginUseCaseMock = {
  login: jest.fn(),
  checkUser: jest.fn(),
};

const createUserUseCaseMock = {
  run: jest.fn(),
};

describe('AuthController', () => {
  let authController: AuthController;
  let loginUseCase: jest.Mocked<LoginUseCase>;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LoginProxy.Token,
          useValue: loginUseCaseMock,
        },
        {
          provide: CreateUserProxy.Token,
          useValue: createUserUseCaseMock,
        },
      ],
      controllers: [AuthController],
    }).compile();

    authController = app.get<AuthController>(AuthController);
    loginUseCase = app.get<jest.Mocked<LoginUseCase>>(LoginProxy.Token);
    createUserUseCase = app.get<jest.Mocked<CreateUserUseCase>>(
      CreateUserProxy.Token,
    );
  });

  it('should be defined', () => {
    expect(createUserUseCase).toBeDefined();
    expect(loginUseCase).toBeDefined();
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    const user: UserModel = {
      id: fakerPT_BR.string.uuid(),
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.lastName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 10 }),
      createdAt: fakerPT_BR.date.anytime(),
      updatedAt: fakerPT_BR.date.anytime(),
      deletedAt: null,
    };

    const token = fakerPT_BR.internet.jwt({
      payload: { sub: user.id, email: user.email },
    });

    const loginResult: AuthResponse = {
      value: {
        token,
        user: plainToInstance(UserPresenter, user),
      },
    };

    beforeAll(() => {
      loginUseCase.login.mockResolvedValueOnce(token);
      loginUseCase.checkUser.mockResolvedValueOnce({ value: user });
    });

    it('should login successfully', async () => {
      const result = await authController.login(user);

      expect(result).toEqual(loginResult);
      expect(loginUseCase.login).toHaveBeenCalledWith<[UserModel]>(user);
    });
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.firstName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 10 }),
    };

    const user: UserModel = {
      id: fakerPT_BR.string.uuid(),
      firstname: createUserDto.firstname,
      lastname: createUserDto.lastname,
      email: createUserDto.email,
      password: createUserDto.password, // actually its not sent to the client
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const token = fakerPT_BR.internet.jwt({
      payload: { sub: user.id, email: user.email },
    });

    const registerResult: AuthResponse = {
      value: {
        token,
        user: plainToInstance(UserPresenter, user),
      },
    };

    beforeAll(() => {
      createUserUseCase.run.mockResolvedValueOnce({ value: user });
      loginUseCase.login.mockResolvedValueOnce(token);
    });

    it('should register a new user', async () => {
      const result = await authController.register(createUserDto);

      expect(result).toEqual(registerResult);
      expect(createUserUseCase.run).toHaveBeenCalledWith<[CreateUserDto]>(
        createUserDto,
      );
      expect(loginUseCase.login).toHaveBeenCalledWith<[UserModel]>(user);
    });
  });
});
