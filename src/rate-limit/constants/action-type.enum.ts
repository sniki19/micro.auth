export const ActionType = {
  LOGIN: 'LOGIN'
} as const

export type ActionType = typeof ActionType[keyof typeof ActionType]
