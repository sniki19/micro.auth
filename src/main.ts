import { join } from 'path'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { Logger } from 'nestjs-pino'
import { AppModule } from './app.module'
import { ExceptionsFilter } from './common/filters'
import { ResponseInterceptor } from './common/interceptors'
import { setupApiDocs } from './static/api-docs/api-docs.setup'


async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  })

  const logger = app.get(Logger)
  app.useLogger(logger)

  app.useStaticAssets(join(process.cwd(), 'src', 'assets'), {
    prefix: '/assets/'
  })

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  app.useGlobalInterceptors(new ResponseInterceptor())

  app.useGlobalFilters(new ExceptionsFilter(logger))

  setupApiDocs(app, {
    swagger: true,
    rapidoc: true
  })

  await app.listen(process.env.API_PORT ?? 3000)
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
