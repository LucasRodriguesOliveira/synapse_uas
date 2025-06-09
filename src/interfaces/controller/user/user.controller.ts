import { Controller, Inject } from '@nestjs/common';
import { UpdateUserProxy } from '../../../infrastructure/proxy/user/update-user.proxy';
import { UpdateUserUseCase } from '../../../application/user/update-user.usecase';
import { DeleteUserProxy } from '../../../infrastructure/proxy/user/delete-user.proxy';
import { DeleteUserUseCase } from '../../../application/user/delete-user.usecase';
import { GrpcMethod } from '@nestjs/microservices';
import { GRPCService } from '../../../infrastructure/grpc/service.enum';
import { FindUserDto } from './dto/find-user.dto';
import { Result } from '../../../domain/types/application/result';
import { ErrorResponse } from '../../../domain/types/application/error.interface';
import { UserPresenter, UserResult } from './presenter/user.presenter';
import { plainToInstance } from 'class-transformer';
import { FindUserProxy } from '../../../infrastructure/proxy/user/find-user.proxy';
import { FindUserUseCase } from '../../../application/user/find-user.usecase';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { UpdateUserById } from './dto/update-user.dto';
import { DeleteUserDto } from './dto/delete-user.dto';

@Controller('user')
export class UserController {
  constructor(
    @Inject(FindUserProxy.Token)
    private readonly findUserUseCase: FindUserUseCase,
    @Inject(UpdateUserProxy.Token)
    private readonly updateUserUseCase: UpdateUserUseCase,
    @Inject(DeleteUserProxy.Token)
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @GrpcMethod(GRPCService.USER)
  public async findById({
    id,
  }: FindUserDto): Promise<Result<UserResult, ErrorResponse>> {
    const result = await this.findUserUseCase.byId(id);

    if (result.error) {
      return {
        error: result.error,
      };
    }

    return {
      value: {
        user: plainToInstance(UserPresenter, result.value),
      },
    };
  }

  @GrpcMethod(GRPCService.USER)
  public async findByEmail({
    email,
  }: FindUserByEmailDto): Promise<Result<UserResult, ErrorResponse>> {
    const result = await this.findUserUseCase.byEmail(email);

    if (result.error) {
      return {
        error: result.error,
      };
    }

    return {
      value: {
        user: plainToInstance(UserPresenter, result.value),
      },
    };
  }

  @GrpcMethod(GRPCService.USER)
  public async update({
    id,
    userData,
  }: UpdateUserById): Promise<Result<UserResult, ErrorResponse>> {
    const result = await this.updateUserUseCase.run(id, userData);

    if (result?.error) {
      return {
        error: result.error,
      };
    }

    return {
      value: {
        user: plainToInstance(UserPresenter, result.value),
      },
    };
  }

  @GrpcMethod(GRPCService.USER)
  public async delete({
    id,
  }: DeleteUserDto): Promise<Result<UserResult, ErrorResponse>> {
    const result = await this.deleteUserUseCase.run(id);

    if (result?.error) {
      return {
        error: result.error,
      };
    }

    return {
      value: {
        user: plainToInstance(UserPresenter, result.value),
      },
    };
  }
}
