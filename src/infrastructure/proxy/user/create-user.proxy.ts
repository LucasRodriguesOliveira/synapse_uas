import { Provider } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { LoggerService } from '../../logger/logger.service';
import { BcryptService } from '../../service/bcrypt/bcrypt.service';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { Proxy } from '..';
import { CreateUserUseCase } from '../../../application/user/create-user.usecase';

const token = Symbol('__CREATE_USER_USE_CASE__');
const provider: Provider = {
  provide: token,
  inject: [UserRepository, LoggerService, BcryptService],
  useFactory: (
    userRepository: IUserRepository,
    loggerService: ILoggerService,
    cryptoService: ICryptoService,
  ) => new CreateUserUseCase(userRepository, loggerService, cryptoService),
};

export const CreateUserProxy = new Proxy(token, provider);
