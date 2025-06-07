import { DatabaseErrors } from './database-errors.enum';

export interface DatabaseError {
  code: DatabaseErrors;
}
