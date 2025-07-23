export const Environment = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
} as const

export type Environment = typeof Environment[keyof typeof Environment]
