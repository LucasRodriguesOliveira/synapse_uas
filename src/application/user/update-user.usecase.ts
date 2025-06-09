import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { UserModel } from '../../domain/model/user.model';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { ErrorCode } from '../../domain/types/application/error-code.enum';
import { ErrorResponse } from '../../domain/types/application/error.interface';
import { Result } from '../../domain/types/application/result';

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggerService: ILoggerService,
  ) {}

  public async run(
    userId: UserModel['id'],
    userData: Partial<UserModel>,
  ): Promise<Result<UserModel, ErrorResponse>> {
    try {
      const userUpdated = await this.userRepository.update(userId, userData);

      this.loggerService.log(
        UpdateUserUseCase.name,
        `User [${userId}] updated`,
      );

      return {
        value: userUpdated,
      };
    } catch (err) {
      const log = {
        message: `Could not update user [${userId}]`,
        error: err,
      };

      this.loggerService.error(UpdateUserUseCase.name, JSON.stringify(log));

      return {
        error: {
          code: ErrorCode.USER_UPDATE,
          message: log.message,
        },
      };
    }
  }
}
