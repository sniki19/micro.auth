import type { JwtModuleOptions } from '@nestjs/jwt'


// eslint-disable-next-line @typescript-eslint/require-await
export const getJwtConfig = async (): Promise<JwtModuleOptions> => {
  const options: JwtModuleOptions = {
    signOptions: {
      algorithm: 'HS256'
    },
    verifyOptions: {
      algorithms: ['HS256'],
      ignoreExpiration: false
    }
  }
  return options
}
