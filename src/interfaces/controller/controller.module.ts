import { Module } from '@nestjs/common';
import { UseCaseProxyModule } from '../../infrastructure/proxy/proxy.module';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';

@Module({
  imports: [UseCaseProxyModule.register()],
  controllers: [AuthController, UserController],
})
export class ControllerModule {}
