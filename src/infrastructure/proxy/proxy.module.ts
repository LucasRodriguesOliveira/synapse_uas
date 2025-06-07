import { DynamicModule, Module } from '@nestjs/common';
import { LoggerModule } from '../logger/logger.module';
import { HttpExceptionModule } from '../http-exception/http-exception.module';
import { BcryptModule } from '../service/bcrypt/bcrypt.module';
import { JwtTokenModule } from '../service/jwt/jwt.module';
import { AuthProxies } from './auth/auth.proxy';
import { UserProxies } from './user/user.proxy';
import { RepositoryModule } from '../repository/repository.module';

@Module({
  imports: [
    LoggerModule,
    HttpExceptionModule,
    BcryptModule,
    JwtTokenModule,
    RepositoryModule,
  ],
})
export class UseCaseProxyModule {
  static register(): DynamicModule {
    return {
      module: UseCaseProxyModule,
      providers: [...AuthProxies.values(), ...UserProxies.values()],
      exports: [...AuthProxies.keys(), ...UserProxies.keys()],
    };
  }
}
