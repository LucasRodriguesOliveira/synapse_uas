import { ICryptoService } from '../../domain/auth/crypto/crypto.interface';
import { JwtPayload } from '../../domain/auth/jwt/jwt-payload.interface';
import { IJwtService } from '../../domain/auth/jwt/jwt.interface';
import { ILoggerService } from '../../domain/logger/logger-service.interface';
import { UserModel } from '../../domain/model/user.model';
import { ErrorCode } from '../../domain/types/application/error-code.enum';
import { ErrorResponse } from '../../domain/types/application/error.interface';
import { Result } from '../../domain/types/application/result';
import { FindUserUseCase } from '../user/find-user.usecase';

export class LoginUseCase {
  constructor(
    private readonly findUserUseCase: FindUserUseCase,
    private readonly cryptoService: ICryptoService,
    private readonly jwtService: IJwtService,
    private readonly loggerService: ILoggerService,
  ) {}

  public async checkUser(
    email: string,
    password: string,
  ): Promise<Result<UserModel, ErrorResponse>> {
    const userResult = await this.findUserUseCase.byEmail(email);

    if (userResult.error) {
      return userResult;
    }

    const user = userResult.value;

    const match = await this.cryptoService.compare(password, user.password);

    if (!match) {
      const log = {
        code: ErrorCode.WRONG_PASSWORD,
        message: `User [${email}] tried: ${password}`,
      };

      this.loggerService.warn(LoginUseCase.name, JSON.stringify(log));

      return {
        error: {
          code: ErrorCode.WRONG_PASSWORD,
          message: 'Invalid credentials',
        },
      };
    }

    return {
      value: user,
    };
  }

  public async login({ id, email }: UserModel): Promise<string> {
    const payload: JwtPayload = {
      sub: id,
      email,
    };

    return this.jwtService.createToken(payload);
  }
}
