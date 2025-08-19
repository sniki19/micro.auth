import * as Joi from 'joi'


export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),

  APP_NAME: Joi.string().default('micro.auth'),
  APP_VERSION: Joi.string().default('1.0.0'),
  API_HOST: Joi.string().default('localhost'),
  API_PORT: Joi.number().port().default(3000),
  RPC_HOST: Joi.string().default('0.0.0.0'),
  RPC_PORT: Joi.number().port().default(53000),

  DATABASE_HOST: Joi.string().default('127.0.0.1'),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_NAME: Joi.string().default('postgres'),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),

  DATABASE_URL: Joi.string().required(),

  ARGON_MEMORY_COST: Joi.number().default(65536),

  FINGERPRINT_SALT: Joi.string(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.string().default('7d')
})
