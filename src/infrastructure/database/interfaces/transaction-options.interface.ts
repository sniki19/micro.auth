import { Prisma } from '@prisma/client'


export interface TransactionOptions {
  prismaTx: Prisma.TransactionClient
}
