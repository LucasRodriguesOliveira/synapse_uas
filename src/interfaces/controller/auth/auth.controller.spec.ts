import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { Request as IRequest } from 'express';
import { fakerPT_BR } from '@faker-js/faker/.';
import { LoginPresenter } from './presenter/login.presenter';
import { UserModel } from '../../../domain/model/user.model';
import { RegisterPresenter } from './presenter/register.presenter';
import { LoginUseCase } from '../../../application/auth/login.usecase';
import { CreateUserUseCase } from '../../../application/user/create-user.usecase';
import { LoginProxy } from '../../../infrastructure/proxy/auth/login.proxy';
import { CreateUserProxy } from '../../../infrastructure/proxy/user/create-user.proxy';
import { plainToInstance } from 'class-transformer';
import { FindUserPresenter } from '../user/presenter/find-user.presenter';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { CreateUserPresenter } from '../user/presenter/create-user.presenter';

const loginUseCaseMock = {
  login: jest.fn(),
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
    };

    // partial because yes
    const req: Partial<IRequest> = {
      user,
    };

    const token = fakerPT_BR.internet.jwt({
      payload: { sub: user.id, email: user.email },
    });

    const loginResult: LoginPresenter = {
      token,
      user: plainToInstance(FindUserPresenter, user),
    };

    beforeAll(() => {
      loginUseCase.login.mockResolvedValueOnce(token);
    });

    it('should login successfully', async () => {
      const result = await authController.login(req as IRequest);

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
    };

    const token = fakerPT_BR.internet.jwt({
      payload: { sub: user.id, email: user.email },
    });

    const registerResult: RegisterPresenter = {
      token,
      user: plainToInstance(CreateUserPresenter, user),
    };

    beforeAll(() => {
      createUserUseCase.run.mockResolvedValueOnce(user);
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
