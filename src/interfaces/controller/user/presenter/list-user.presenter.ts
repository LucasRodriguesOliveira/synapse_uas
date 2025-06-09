import { UserModel } from '../../../../domain/model/user.model';

export interface ListUserPresenter {
  users: UserModel[];
}
