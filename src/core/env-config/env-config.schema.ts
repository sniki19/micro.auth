import * as Joi from 'joi'


export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  API_PORT: Joi.number().port().default(3000),

  DATABASE_URL: Joi.string().required(),

  ARGON_MEMORY_COST: Joi.number().default(65536),

  FINGERPRINT_SALT: Joi.string(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_TTL: Joi.string().default('7d')
})
