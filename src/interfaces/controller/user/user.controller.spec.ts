import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { FindUserByIdProxy } from '../../../infrastructure/proxy/user/find-user-by-id.proxy';
import { UserModel } from '../../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker/.';

const findUserByIdUseCaseMock = {
  run: jest.fn(),
};

describe('UserController', () => {
  let userController: UserController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: FindUserByIdProxy.Token, useValue: findUserByIdUseCaseMock },
      ],
      controllers: [UserController],
    }).compile();

    userController = app.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('find', () => {
    const user: UserModel = {
      id: fakerPT_BR.string.uuid(),
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.lastName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 10 }),
      createdAt: fakerPT_BR.date.anytime(),
      updatedAt: fakerPT_BR.date.anytime(),
    };

    // The user is actually extracted from JWT through use of Guards and Decorators
    // Which simplifies the development and testing process
    // So the connected user is simply passed by parameter, where there's, basically,
    // no need to previous configuration
    it('should return the connected user extracting from jwt', () => {
      const result = userController.find(user);

      expect(result).toEqual(user);
    });
  });
});
