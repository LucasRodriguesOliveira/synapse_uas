import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getGrpcOptions } from './infrastructure/config/grpc/grpc.option';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const { HOST, PORT } = process.env;

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    getGrpcOptions(`${HOST}:${PORT}`),
  );

  await app.listen();
}
void bootstrap();
