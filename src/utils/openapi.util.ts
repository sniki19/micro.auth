import { INestApplication } from '@nestjs/common'
import { SwaggerModule } from '@nestjs/swagger'
import { getOpenApiConfig, getOpenApiOptions } from 'src/config/openapi.config'
import { RapidocModule } from '@b8n/nestjs-rapidoc'


interface OpenApiSetupOptions {
  swagger: boolean
  rapidoc: boolean
}

export function setupOpenApi(app: INestApplication, setupOptions: OpenApiSetupOptions) {
  if (!setupOptions.swagger && !setupOptions.rapidoc) return void 0

  const config = getOpenApiConfig()
  const options = getOpenApiOptions()
  const document = SwaggerModule.createDocument(app, config)

  if (setupOptions.swagger) {
    SwaggerModule.setup('/docs', app, document, options)
  }

  if (setupOptions.rapidoc) {
    RapidocModule.setup('/rapidoc', app, document, options)
  }
}
