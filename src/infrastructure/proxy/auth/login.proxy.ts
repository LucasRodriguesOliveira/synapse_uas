import { Provider } from '@nestjs/common';
import { LoginUseCase } from '../../../application/auth/login.usecase';
import { IUserRepository } from '../../../domain/repository/user-repository.interface';
import { ILoggerService } from '../../../domain/logger/logger-service.interface';
import { IJwtService } from '../../../domain/auth/jwt/jwt.interface';
import { ICryptoService } from '../../../domain/auth/crypto/crypto.interface';
import { UserRepository } from '../../repository/user.repository';
import { LoggerService } from '../../logger/logger.service';
import { JwtTokenService } from '../../service/jwt/jwt.service';
import { BcryptService } from '../../service/bcrypt/bcrypt.service';
import { Proxy } from '..';
import { FindUserUseCase } from '../../../application/user/find-user.usecase';

const token = Symbol('__LOGIN_USE_CASE__');
const provider: Provider = {
  provide: token,
  inject: [UserRepository, LoggerService, JwtTokenService, BcryptService],
  useFactory: (
    userRepository: IUserRepository,
    loggerService: ILoggerService,
    jwtTokenService: IJwtService,
    cryptoService: ICryptoService,
  ) =>
    new LoginUseCase(
      new FindUserUseCase(userRepository, loggerService),
      cryptoService,
      jwtTokenService,
      loggerService,
    ),
};

export const LoginProxy = new Proxy(token, provider);
