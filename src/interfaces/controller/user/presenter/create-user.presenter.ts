import { Exclude, Expose } from 'class-transformer';
import { UserModel } from '../../../../domain/model/user.model';
import { ApiProperty } from '@nestjs/swagger';
import { fakerPT_BR } from '@faker-js/faker';

@Exclude()
export class CreateUserPresenter extends UserModel {
  @Expose()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.string.uuid(),
  })
  declare id: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.person.firstName(),
  })
  declare firstname: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.person.lastName(),
  })
  declare lastname: string;

  @Expose()
  @ApiProperty({
    type: String,
    example: fakerPT_BR.internet.email(),
  })
  declare email: string;

  @Expose()
  @ApiProperty({
    type: Date,
    example: fakerPT_BR.date.anytime(),
  })
  declare createdAt: Date;
}
