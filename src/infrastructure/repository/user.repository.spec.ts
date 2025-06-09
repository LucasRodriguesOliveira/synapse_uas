import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UserRepository } from './user.repository';
import { UserModel } from '../../domain/model/user.model';
import { fakerPT_BR } from '@faker-js/faker';
import { IUserRepository } from '../../domain/repository/user-repository.interface';

const prismaServiceMock = {
  user: {
    create: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
};

// TODO: UPDATE and DELETE functions

describe('UserRepository', () => {
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        { provide: PrismaService, useValue: prismaServiceMock },
      ],
    }).compile();

    userRepository = app.get<UserRepository>(UserRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    const userData: Partial<UserModel> = {
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.lastName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 12 }),
    };

    const createdUser: UserModel = {
      id: fakerPT_BR.string.uuid(),
      firstname: userData.firstname!,
      lastname: userData.lastname!,
      email: userData.email!,
      password: userData.password!,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    beforeAll(() => {
      prismaServiceMock.user.create.mockResolvedValueOnce(createdUser);
    });

    it('should create a user', async () => {
      const result = await userRepository.create(userData);

      expect(result).toEqual(createdUser);
      expect(prismaServiceMock.user.create).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
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

    beforeAll(() => {
      prismaServiceMock.user.findUniqueOrThrow.mockResolvedValueOnce(user);
    });

    it('should return a user by id', async () => {
      const result = await userRepository.findById(userId);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findUniqueOrThrow).toHaveBeenCalled();
    });
  });

  describe('findByEmail', () => {
    const email: string = fakerPT_BR.internet.email();
    const user: UserModel = {
      id: fakerPT_BR.string.uuid(),
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.lastName(),
      email,
      password: fakerPT_BR.internet.password({ length: 12 }),
      createdAt: fakerPT_BR.date.anytime(),
      updatedAt: fakerPT_BR.date.anytime(),
      deletedAt: null,
    };

    beforeAll(() => {
      prismaServiceMock.user.findFirst.mockResolvedValueOnce(user);
    });

    it('should return a user by email', async () => {
      const result = await userRepository.findByEmail(email);

      expect(result).toEqual(user);
      expect(prismaServiceMock.user.findFirst).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const user: UserModel = {
      id: fakerPT_BR.string.uuid(),
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.lastName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 12 }),
      createdAt: fakerPT_BR.date.anytime(),
      updatedAt: fakerPT_BR.date.anytime(),
      deletedAt: null,
    };

    beforeAll(() => {
      prismaServiceMock.user.update.mockResolvedValueOnce(user);
    });

    it('should return an updated user', async () => {
      const result = await userRepository.update(user.id, user);

      expect(result).toBe(user);
      expect(prismaServiceMock.user.update).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    const user: UserModel = {
      id: fakerPT_BR.string.uuid(),
      firstname: fakerPT_BR.person.firstName(),
      lastname: fakerPT_BR.person.lastName(),
      email: fakerPT_BR.internet.email(),
      password: fakerPT_BR.internet.password({ length: 12 }),
      createdAt: fakerPT_BR.date.anytime(),
      updatedAt: fakerPT_BR.date.anytime(),
      deletedAt: new Date(),
    };

    beforeAll(() => {
      prismaServiceMock.user.update.mockResolvedValueOnce(user);
    });

    it('should return a deleted user by id', async () => {
      const result = await userRepository.deleteById(user.id);

      expect(result).toBe(user);
      expect(prismaServiceMock.user.update).toHaveBeenCalled();
    });
  });
});
