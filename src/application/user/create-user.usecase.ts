import { ICryptoService } from '../../domain/auth/crypto/crypto.interface';
import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { UserModel } from '../../domain/model/user.model';
import { IUserRepository } from '../../domain/repository/user-repository.interface';
import { ErrorCode } from '../../domain/types/application/error-code.enum';
import { ErrorResponse } from '../../domain/types/application/error.interface';
import { Result } from '../../domain/types/application/result';

export class CreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly loggerService: ILoggerService,
    private readonly cryptoService: ICryptoService,
  ) {}

  public async run(
    userData: Partial<UserModel>,
  ): Promise<Result<UserModel, ErrorResponse>> {
    const hashPassword = await this.cryptoService.hash(userData.password!);
    userData.password = hashPassword;

    try {
      const userCreated = await this.userRepository.create(userData);
      const log = {
        message: `User [${userCreated.id}] created!`,
        params: userData,
        result: userCreated,
      };

      this.loggerService.log(CreateUserUseCase.name, JSON.stringify(log));

      return {
        value: userCreated,
      };
    } catch (err) {
      const log = {
        message: `User could not be created`,
        params: userData,
        error: err,
      };
      this.loggerService.error(CreateUserUseCase.name, JSON.stringify(log));
      return {
        error: {
          code: ErrorCode.USER_CREATE,
          message: log.message,
        },
      };
    }
  }
}
