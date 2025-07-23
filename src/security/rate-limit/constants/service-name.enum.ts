export const ServiceName = {
  AUTH_LOGIN: 'AUTH_LOGIN'
} as const

export type ServiceName = typeof ServiceName[keyof typeof ServiceName]
