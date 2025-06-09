import { Provider } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { LoggerService } from '../../logger/logger.service';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { DeleteUserUseCase } from '../../../application/user/delete-user.usecase';
import { Proxy } from '..';

const token = Symbol('__DELETE_USER_USE_CASE__');
const provider: Provider = {
  provide: token,
  inject: [UserRepository, LoggerService],
  useFactory: (
    userRepository: IUserRepository,
    loggerService: ILoggerService,
  ) => new DeleteUserUseCase(userRepository, loggerService),
};

export const DeleteUserProxy = new Proxy(token, provider);
