import { Provider } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { UserRepository } from '../../repository/user.repository';
import { LoggerService } from '../../logger/logger.service';
import { Proxy } from '..';
import { FindUserUseCase } from '../../../application/user/find-user.usecase';

const token = Symbol('__FIND_USER_USE_CASE__');
const provider: Provider = {
  provide: token,
  useFactory: (
    userRepository: IUserRepository,
    loggerService: ILoggerService,
  ) => new FindUserUseCase(userRepository, loggerService),
  inject: [UserRepository, LoggerService],
};

export const FindUserProxy = new Proxy(token, provider);
