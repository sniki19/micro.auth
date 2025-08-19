import { join } from 'path'
import { CustomLogger } from '@logger/logger.service'
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import { HttpExceptionsFilter } from './common/filters'
import { HttpResponseInterceptor } from './common/interceptors'
import { setupApiDocs } from './static/api-docs/api-docs.setup'


async function bootstrapHttpServer() {
  const port = process.env.API_PORT ?? 3000
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true
  })

  const logger = app.get(CustomLogger)
  app.useLogger(logger)

  app.useStaticAssets(join(process.cwd(), 'src', 'assets'), {
    prefix: '/assets/'
  })

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true
  }))

  app.useGlobalInterceptors(new HttpResponseInterceptor(logger))
  app.useGlobalFilters(new HttpExceptionsFilter(logger))

  setupApiDocs(app, {
    swagger: true,
    rapidoc: true
  })

  await app.listen(port)
  logger.success(`HTTP server started on port ${port}`)
}

export default bootstrapHttpServer
