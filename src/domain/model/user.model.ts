export class UserModel {
  id: string;
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
