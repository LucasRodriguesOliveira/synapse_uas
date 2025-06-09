import { ConfigModuleOptions } from '@nestjs/config';
import { appConfig } from './app.config';
import { tokenConfig } from './token.config';
import { envSchema } from './env.schema';
import { pinoConfig } from './pino.config';

export const envConfig: ConfigModuleOptions = {
  load: [appConfig, tokenConfig, pinoConfig],
  validationSchema: envSchema,
  isGlobal: true,
};
