import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envConfig } from './infrastructure/config/env/env.config';
import { JwtModule } from '@nestjs/jwt';
import { tokenConfig } from './infrastructure/config/token/token.config';
import { LoggerModule } from 'nestjs-pino';
import { pinoConfig } from './infrastructure/config/pino/pino.config';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { LoggerModule as CustomLoggerModule } from './infrastructure/logger/logger.module';
import { UseCaseProxyModule } from './infrastructure/proxy/proxy.module';
import { ControllerModule } from './interfaces/controller/controller.module';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    JwtModule.registerAsync(tokenConfig()),
    LoggerModule.forRootAsync(pinoConfig()),
    PrismaModule,
    CustomLoggerModule,
    UseCaseProxyModule.register(),
    ControllerModule,
  ],
})
export class AppModule {}
