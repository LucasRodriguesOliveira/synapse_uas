import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams } from 'nestjs-pino';
import { PINOCONFIG_TOKEN } from '../env/pino.config';
import { Options } from 'pino-http';

export const pinoConfig = (): LoggerModuleAsyncParams => ({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const { level, transport } = configService.get<Options>(
      PINOCONFIG_TOKEN.description!,
    )!;

    return {
      pinoHttp: {
        level,
        transport,
      },
    };
  },
});
