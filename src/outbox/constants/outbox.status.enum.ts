export const OutboxStatus = {
  PENDING: 'PENDING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED'
} as const

export type OutboxStatus = typeof OutboxStatus[keyof typeof OutboxStatus]
