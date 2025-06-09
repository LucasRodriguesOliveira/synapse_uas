import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { UserModel } from '../../domain/model/user.model';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { ErrorCode } from '../../domain/types/application/error-code.enum';
import { ErrorResponse } from '../../domain/types/application/error.interface';
import { Result } from '../../domain/types/application/result';

export class DeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggerService: ILoggerService,
  ) {}

  public async run(
    userId: UserModel['id'],
  ): Promise<Result<UserModel, ErrorResponse>> {
    try {
      const userDeleted = await this.userRepository.deleteById(userId);

      this.loggerService.log(
        DeleteUserUseCase.name,
        `Soft Delete: user [${userId}]`,
      );

      return {
        value: userDeleted,
      };
    } catch (err) {
      const log = {
        message: `Could not delete user`,
        error: err,
      };

      this.loggerService.error(DeleteUserUseCase.name, JSON.stringify(log));

      return {
        error: {
          code: ErrorCode.USER_DELETE,
          message: log.message,
        },
      };
    }
  }
}
