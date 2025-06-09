import { Controller, Inject } from '@nestjs/common';
import { LoginProxy } from '../../../infrastructure/proxy/auth/login.proxy';
import { LoginUseCase } from '../../../application/auth/login.usecase';
import { CreateUserProxy } from '../../../infrastructure/proxy/user/create-user.proxy';
import { CreateUserUseCase } from '../../../application/user/create-user.usecase';
import { plainToInstance } from 'class-transformer';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPCService } from '../../../infrastructure/grpc/service.enum';
import { LoginRequest } from './dto/login.dto';
import { AuthResponse } from './presenter/auth-response.presenter';
import { UserPresenter } from '../user/presenter/user.presenter';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(LoginProxy.Token)
    private readonly loginUseCase: LoginUseCase,
    @Inject(CreateUserProxy.Token)
    private readonly createUserUseCase: CreateUserUseCase,
  ) {}

  @GrpcMethod(GRPCService.AUTH)
  public async login({ email, password }: LoginRequest): Promise<AuthResponse> {
    const result = await this.loginUseCase.checkUser(email, password);

    if (result.error) {
      return {
        error: result.error,
      };
    }

    const token = await this.loginUseCase.login(result.value);

    return {
      value: {
        token,
        user: plainToInstance(UserPresenter, result.value),
      },
    };
  }

  @GrpcMethod(GRPCService.AUTH)
  public async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const userResult = await this.createUserUseCase.run(registerDto);

    if (userResult.error) {
      return {
        error: userResult.error,
      };
    }

    const token = await this.loginUseCase.login(userResult.value);

    return {
      value: {
        token,
        user: plainToInstance(UserPresenter, userResult.value),
      },
    };
  }
}
