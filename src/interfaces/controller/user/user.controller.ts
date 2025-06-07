import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { FindUserPresenter } from './presenter/find-user.presenter';
import { PresenterInterceptor } from '../../../infrastructure/common/interceptor/presenter.interceptor';
import { UserModel } from '../../../domain/model/user.model';
import { FindUserByIdProxy } from '../../../infrastructure/proxy/user/find-user-by-id.proxy';
import { FindUserByIdUseCase } from '../../../application/user/find-user-by-id.usecase';
import { GetUser } from '../../../infrastructure/common/decorator/get-user.decorator';
import { JwtGuard } from '../../../infrastructure/common/guard/jwt.guard';

@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    @Inject(FindUserByIdProxy.Token)
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: FindUserPresenter,
  })
  @ApiBearerAuth()
  @UseInterceptors(new PresenterInterceptor(FindUserPresenter))
  @UseGuards(JwtGuard)
  public find(@GetUser() user: UserModel): UserModel {
    return user;
  }
}
