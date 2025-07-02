export const OutboxEventType = {
  USER_CREATED: 'UserCreated',
  PASSWORD_CHANGED: 'PasswordChanged',
  ACCOUNT_BLOCKED: 'AccountBlocked',
  EMAIL_VERIFIED: 'EmailVerified',
  PROFILE_UPDATED: 'ProfileUpdated'
} as const

export type OutboxEventType = typeof OutboxEventType[keyof typeof OutboxEventType]
