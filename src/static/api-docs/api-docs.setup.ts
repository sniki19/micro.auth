import { RapidocModule } from '@b8n/nestjs-rapidoc'
import { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'
import { getApiDocConfig, getUiOptions } from './api-docs.config'


interface ApiDocSetupOptions {
  swagger: boolean
  rapidoc: boolean
}

export function setupApiDocs(app: INestApplication, setupOptions: ApiDocSetupOptions) {
  if (!setupOptions.swagger && !setupOptions.rapidoc) return void 0

  const config = getApiDocConfig()
  const options = getUiOptions()
  const document = SwaggerModule.createDocument(app, config)

  if (setupOptions.swagger) {
    SwaggerModule.setup('/docs', app, document, options)
  }

  if (setupOptions.rapidoc) {
    RapidocModule.setup('/rapidoc', app, document, options)
  }
}
