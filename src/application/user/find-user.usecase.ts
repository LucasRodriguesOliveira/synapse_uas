import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { UserModel } from '../../domain/model/user.model';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { ErrorCode } from '../../domain/types/application/error-code.enum';
import { ErrorResponse } from '../../domain/types/application/error.interface';
import { Result } from '../../domain/types/application/result';
import { DatabaseErrors } from '../../domain/types/database/database-errors.enum';
import { DatabaseError } from '../../domain/types/database/database.error';

export class FindUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggerService: ILoggerService,
  ) {}

  public async byId(userId: string): Promise<Result<UserModel, ErrorResponse>> {
    let user: UserModel;

    try {
      user = await this.userRepository.findById(userId);

      return {
        value: user,
      };
    } catch (err) {
      const { code } = err as DatabaseError;

      if (DatabaseErrors.NOT_FOUND === code) {
        this.loggerService.warn(
          FindUserUseCase.name,
          `User [${userId}] could not be found.`,
        );

        return {
          error: {
            code: ErrorCode.USER_NOT_FOUND,
            message: 'User not found',
          },
        };
      }

      const log = {
        message: 'Unexpected error occurred!',
        error: err,
      };

      this.loggerService.error(FindUserUseCase.name, JSON.stringify(log));

      return {
        error: {
          code: ErrorCode.UNEXPECTED,
          message: log.message,
        },
      };
    }
  }

  public async byEmail(
    email: string,
  ): Promise<Result<UserModel, ErrorResponse>> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      this.loggerService.warn(
        FindUserUseCase.name,
        `User [${email}] could not be found.`,
      );

      return {
        error: {
          code: ErrorCode.USER_NOT_FOUND,
          message: 'User not found',
        },
      };
    }

    return {
      value: user,
    };
  }
}
