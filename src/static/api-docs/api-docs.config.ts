import { DocumentBuilder } from '@nestjs/swagger'


export function getApiDocConfig() {
  return new DocumentBuilder()
    .setTitle('Micro.auth Service')
    .setDescription('API documentation for Micro.auth Service')
    // .setVersion('1.0.0')
    // .setContact('Sniki19', 'http://sniki.19', 'support@sniki.19')
    // .setLicense('MIT', 'https://github.com')
    // .addBearerAuth()
    .build()
}

export function getUiOptions() {
  return {
    customSiteTitle: 'Micro.auth Api Documentation',
    customfavIcon: '/static/assets/favicon.ico',
    customFavIcon: '/static/assets/favicon.ico'
  }
}
