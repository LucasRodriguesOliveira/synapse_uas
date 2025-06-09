import { UserModel } from '../../../../domain/model/user.model';
import { ErrorResponse } from '../../../../domain/types/application/error.interface';
import { Result } from '../../../../domain/types/application/result';

export interface AuthResult {
  user: UserModel;
  token: string;
}

export type AuthResponse = Result<AuthResult, ErrorResponse>;
