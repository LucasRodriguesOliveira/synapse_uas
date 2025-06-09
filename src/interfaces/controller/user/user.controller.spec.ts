import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserModel } from '../../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker/.';
import { FindUserProxy } from '../../../infrastructure/proxy/user/find-user.proxy';
import { UserPresenter, UserResult } from './presenter/user.presenter';
import { FindUserUseCase } from '../../../application/user/find-user.usecase';
import { UpdateUserUseCase } from '../../../application/user/update-user.usecase';
import { DeleteUserUseCase } from '../../../application/user/delete-user.usecase';
import { UpdateUserProxy } from '../../../infrastructure/proxy/user/update-user.proxy';
import { DeleteUserProxy } from '../../../infrastructure/proxy/user/delete-user.proxy';
import { plainToInstance } from 'class-transformer';
import { ErrorResponse } from '../../../domain/types/application/error.interface';
import { ErrorCode } from '../../../domain/types/application/error-code.enum';
import { UpdateUserById } from './dto/update-user.dto';

const findUserUseCaseMock = {
  byId: jest.fn(),
  byEmail: jest.fn(),
};

const updateUserUseCaseMock = {
  run: jest.fn(),
};

const deleteUserUseCaseMock = {
  run: jest.fn(),
};

describe('UserController', () => {
  let userController: UserController;
  let findUserUseCase: jest.Mocked<FindUserUseCase>;
  let updateUserUseCase: jest.Mocked<UpdateUserUseCase>;
  let deleteUserUseCase: jest.Mocked<DeleteUserUseCase>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: FindUserProxy.Token, useValue: findUserUseCaseMock },
        { provide: UpdateUserProxy.Token, useValue: updateUserUseCaseMock },
        { provide: DeleteUserProxy.Token, useValue: deleteUserUseCaseMock },
      ],
      controllers: [UserController],
    }).compile();

    userController = app.get<UserController>(UserController);
    findUserUseCase = app.get(FindUserProxy.Token);
    updateUserUseCase = app.get(UpdateUserProxy.Token);
    deleteUserUseCase = app.get(DeleteUserProxy.Token);
  });

  it('should be defined', () => {
    expect(deleteUserUseCase).toBeDefined();
    expect(updateUserUseCase).toBeDefined();
    expect(findUserUseCase).toBeDefined();
    expect(userController).toBeDefined();
  });

  describe('findById', () => {
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

    describe('Success', () => {
      const userResult: UserResult = {
        user: plainToInstance(UserPresenter, user),
      };

      beforeAll(() => {
        findUserUseCase.byId.mockResolvedValueOnce({ value: user });
      });

      it('should return an user successfully', async () => {
        const result = await userController.findById({ id: user.id });

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toHaveProperty('user');
        expect(result.value).toStrictEqual(userResult);
        expect(findUserUseCase.byId).toHaveBeenCalledWith<[UserModel['id']]>(
          user.id,
        );
      });
    });

    describe('Failure', () => {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.USER_NOT_FOUND,
        message: 'User not found',
      };

      beforeAll(() => {
        findUserUseCase.byId.mockResolvedValueOnce({ error: errorResponse });
      });

      it('should not find an user', async () => {
        const result = await userController.findById({ id: user.id });

        expect(result).not.toHaveProperty('value');
        expect(result).toHaveProperty('error');
        expect(result.error).toBe(errorResponse);
        expect(findUserUseCase.byId).toHaveBeenCalledWith<[UserModel['id']]>(
          user.id,
        );
      });
    });
  });

  describe('findByEmail', () => {
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

    describe('Success', () => {
      const userResult: UserResult = {
        user: plainToInstance(UserPresenter, user),
      };

      beforeAll(() => {
        findUserUseCase.byEmail.mockResolvedValueOnce({ value: user });
      });

      it('should return an user by email', async () => {
        const result = await userController.findByEmail({ email: user.email });

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toStrictEqual(userResult);
        expect(findUserUseCase.byEmail).toHaveBeenCalledWith<[string]>(
          user.email,
        );
      });
    });

    describe('Failure', () => {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.USER_NOT_FOUND,
        message: 'User not found',
      };

      beforeAll(() => {
        findUserUseCase.byEmail.mockResolvedValueOnce({ error: errorResponse });
      });

      it('should return an error', async () => {
        const result = await userController.findByEmail({ email: user.email });

        expect(result).not.toHaveProperty('value');
        expect(result).toHaveProperty('error');
        expect(result.error).toBe(errorResponse);
        expect(findUserUseCase.byEmail).toHaveBeenCalledWith<[string]>(
          user.email,
        );
      });
    });
  });

  describe('update', () => {
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

    describe('Success', () => {
      const userResult: UserResult = {
        user: plainToInstance(UserPresenter, user),
      };

      beforeAll(() => {
        updateUserUseCase.run.mockResolvedValueOnce({ value: user });
      });

      it('should update an user', async () => {
        const result = await userController.update({
          id: user.id,
          userData: user,
        });

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toStrictEqual(userResult);
        expect(updateUserUseCase.run).toHaveBeenCalledWith<
          [string, UpdateUserById['userData']]
        >(user.id, user);
      });
    });

    describe('Failure', () => {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.USER_UPDATE,
        message: `Could not update user [${user.id}]`,
      };

      beforeAll(() => {
        updateUserUseCase.run.mockResolvedValueOnce({ error: errorResponse });
      });

      it('should return an error', async () => {
        const result = await userController.update({
          id: user.id,
          userData: user,
        });

        expect(result).toHaveProperty('error');
        expect(result).not.toHaveProperty('value');
        expect(result.error?.code).toBe(ErrorCode.USER_UPDATE);
        expect(updateUserUseCase.run).toHaveBeenCalledWith<
          [string, UpdateUserById['userData']]
        >(user.id, user);
      });
    });
  });

  describe('delete', () => {
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

    describe('Success', () => {
      const userResult: UserResult = {
        user: plainToInstance(UserPresenter, user),
      };

      beforeAll(() => {
        deleteUserUseCase.run.mockResolvedValueOnce({ value: user });
      });

      it('should delete an user', async () => {
        const result = await userController.delete({ id: user.id });

        expect(result).toHaveProperty('value');
        expect(result).not.toHaveProperty('error');
        expect(result.value).toStrictEqual(userResult);
        expect(deleteUserUseCase.run).toHaveBeenCalledWith<[string]>(user.id);
      });
    });

    describe('Failure', () => {
      const errorResponse: ErrorResponse = {
        code: ErrorCode.USER_DELETE,
        message: 'Could not delete user',
      };

      beforeAll(() => {
        deleteUserUseCase.run.mockResolvedValueOnce({ error: errorResponse });
      });

      it('should return an error', async () => {
        const result = await userController.delete({ id: user.id });

        expect(result).not.toHaveProperty('value');
        expect(result).toHaveProperty('error');
        expect(result.error?.code).toBe(ErrorCode.USER_DELETE);
        expect(deleteUserUseCase.run).toHaveBeenCalledWith<[string]>(user.id);
      });
    });
  });
});
