export const OutboxEventType = {
  USER_REGISTERED: 'UserRegistered',
  USER_LOGGED_IN: 'UserLoggedIn',
  USER_LOGGED_OUT: 'UserLoggedOut',
  PASSWORD_CHANGED: 'PasswordChanged',
  ACCOUNT_BLOCKED: 'AccountBlocked',
  EMAIL_VERIFIED: 'EmailVerified',
  PROFILE_UPDATED: 'ProfileUpdated'
} as const

export type OutboxEventType = typeof OutboxEventType[keyof typeof OutboxEventType]
