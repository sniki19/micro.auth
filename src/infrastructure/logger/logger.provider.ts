import { ConfigService } from '@nestjs/config'
import { Request, Response } from 'express'
import { multistream } from 'pino-multi-stream'
import { getPinoConfig } from './logger.config'


export const loggerProvider = {
  useFactory: (configService: ConfigService) => {
    const pinoConfig = getPinoConfig(configService)

    return {
      pinoHttp: {
        ...pinoConfig,
        stream: multistream(pinoConfig.streams),
        customLogLevel: (_req: Request, res: Response, err?: Error) => {
          // if (req.url.startsWith('/api')) return 'silent'
          if (err || res.statusCode >= 500) return 'error'
          if (res.statusCode >= 400) return 'warn'
          return 'info'
        },
        serializers: {
          req: (_req: Request) => {
            return void 0
            // return {
            //   method: req.method,
            //   url: req.url,
            //   headers: {
            //     // ...req.headers,
            //     'user-agent': req.headers['user-agent'],
            //     authorization: req.headers.authorization ? '[REDACTED]' : undefined,
            //     cookie: undefined
            //   }
            // }
          },
          res: (res: Response) => {
            return {
              statusCode: res.statusCode
            }
          },
          err: (err: Error) => {
            return {
              type: err.name,
              message: err.message,
              stack: err.stack
            }
          }
        },
        formatters: {
          log: (object: unknown): Record<string, unknown> => {
            if (typeof object === 'string') {
              return { msg: object }
            }

            if (typeof object === 'object' && object !== null) {
              return object as Record<string, unknown>
            }

            return { msg: String(object) }
          }
        },
        autoLogging: false
        // autoLogging: {
        //   ignore: (req: Request) => {
        //     const ignorePaths = ['/health', '/docs', '/rapidoc']
        //     return ignorePaths.includes(req.url)
        //   }
        // }
      }
    }
  },
  inject: [ConfigService]
}
