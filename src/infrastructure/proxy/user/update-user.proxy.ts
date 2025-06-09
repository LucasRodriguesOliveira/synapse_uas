import { Provider } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { LoggerService } from '../../logger/logger.service';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { UpdateUserUseCase } from '../../../application/user/update-user.usecase';
import { Proxy } from '..';

const token = Symbol('__UPDATE_USER_USE_CASE__');
const provider: Provider = {
  provide: token,
  inject: [UserRepository, LoggerService],
  useFactory: (
    userRepository: IUserRepository,
    loggerService: ILoggerService,
  ) => new UpdateUserUseCase(userRepository, loggerService),
};

export const UpdateUserProxy = new Proxy(token, provider);
