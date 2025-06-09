import {
  Exclude,
  Expose,
  Transform,
  TransformFnParams,
} from 'class-transformer';
import { UserModel } from '../../../../domain/model/user.model';

export interface UserResult {
  user: UserPresenter;
}

@Exclude()
export class UserPresenter extends UserModel {
  @Expose()
  declare id: string;

  @Expose()
  declare firstname: string;

  @Expose()
  declare lastname: string;

  @Expose()
  declare email: string;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value as Date).toISOString())
  declare createdAt: Date;

  @Expose()
  @Transform(({ value }: TransformFnParams) => (value as Date).toISOString())
  declare updatedAt: Date;
}
