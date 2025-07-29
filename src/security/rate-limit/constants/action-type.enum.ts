export const ActionType = {
  LOGIN: 'LOGIN',
  PASSWORD_RESET: 'PASSWORD_RESET',
  TWO_FACTOR_VERIFICATION: 'TWO_FACTOR_VERIFICATION'
} as const

export type ActionType = typeof ActionType[keyof typeof ActionType]
