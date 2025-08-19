import { join } from 'path'
import { CustomLogger } from '@logger/logger.service'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'
import { GrpcExceptionsFilter } from './common/filters'
import { GrpcResponseInterceptor } from './common/interceptors'


async function bootstrapGrpcServer() {
  const host = process.env.RPC_HOST ?? '0.0.0.0'
  const port = process.env.RPC_PORT ?? 53000
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        url: `${host}:${port}`,
        package: 'auth',
        protoPath: join(__dirname, '../proto/auth.proto')
      },
      logger: false,
      bufferLogs: true
    }
  )

  const logger = app.get(CustomLogger)
  app.useLogger(logger)

  app.useGlobalInterceptors(new GrpcResponseInterceptor(logger))
  app.useGlobalFilters(new GrpcExceptionsFilter(logger))

  await app.listen()
  logger.success(`gRPC server started on port ${port}`)
}

export default bootstrapGrpcServer
