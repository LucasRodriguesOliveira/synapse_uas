import { UserModel } from '../model/user.model';

export interface IUserRepository {
  create(userData: Partial<UserModel>): Promise<UserModel>;
  findById(userId: string): Promise<UserModel>;
  findByEmail(email: string): Promise<UserModel | null>;
  update(userId: string, userToUpdate: Partial<UserModel>): Promise<UserModel>;
  deleteById(userId: string): Promise<UserModel>;
}
