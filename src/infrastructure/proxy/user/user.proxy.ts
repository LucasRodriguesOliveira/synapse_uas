import { Provider } from '@nestjs/common';
import { CreateUserProxy } from './create-user.proxy';
import { FindUserProxy } from './find-user.proxy';
import { UpdateUserProxy } from './update-user.proxy';
import { DeleteUserProxy } from './delete-user.proxy';

export const UserProxies: Map<symbol, Provider> = new Map([
  CreateUserProxy.Entry,
  FindUserProxy.Entry,
  UpdateUserProxy.Entry,
  DeleteUserProxy.Entry,
]);
