import { CustomLogger, CustomLoggerWithContext } from '@logger/logger.service'
import { Injectable } from '@nestjs/common'
import { CommandBus, ICommand } from '@nestjs/cqrs'
import { createId } from '@paralleldrive/cuid2'
import { ICommandBus } from './command-bus.interface'


@Injectable()
export class AdvancedCommandBus extends ICommandBus {
  private readonly logger: CustomLoggerWithContext
  private readonly pendingCommands = new Map<string, { command: ICommand; timestamp: Date }>()

  constructor(
    private readonly customLogger: CustomLogger,
    private readonly commandBus: CommandBus
  ) {
    super()
    this.logger = this.customLogger.withContext(AdvancedCommandBus.name)
  }

  async execute<T extends ICommand, R = any>(command: T): Promise<R> {
    const commandId = createId()
    const commandName = command.constructor.name
    this.logger.log(`Executing command ${commandName}`, { commandId })

    try {
      const startTime = Date.now()
      const result: R = await this.commandBus.execute(command)
      const executionTime = Date.now() - startTime

      this.logger.log(`Command ${commandName} executed successfully`, { commandId, executionTime })
      return result
    } catch (error: unknown) {
      this.logger.error(`Command ${commandName} failed`, { commandId, error })
      throw error
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async dispatch<T extends ICommand>(command: T): Promise<string> {
    const commandId = createId()
    const commandName = command.constructor.name
    this.pendingCommands.set(commandId, {
      command,
      timestamp: new Date()
    })

    this.logger.log(`Dispatched command ${commandName}`, { commandId })

    this.executeCommandAsync(commandId, command).catch((error: unknown) => {
      this.logger.error(`Async command ${commandName} execution failed`, { commandId, error })
    })

    return commandId
  }

  private async executeCommandAsync(commandId: string, command: ICommand): Promise<void> {
    try {
      await this.commandBus.execute(command)
      this.pendingCommands.delete(commandId)
      this.logger.log('Async command executed successfully', { commandId })
    } catch (error: unknown) {
      this.logger.error('Async command execution failed', { commandId, error })
    }
  }

  getPendingCommands(): Map<string, { command: ICommand; timestamp: Date }> {
    return new Map(this.pendingCommands)
  }

  getCommandStatus(commandId: string): { status: 'pending' | 'completed' | 'failed'; timestamp: Date } {
    const command = this.pendingCommands.get(commandId)
    return command
      ? { status: 'pending', timestamp: command.timestamp }
      : { status: 'completed', timestamp: new Date() }
  }
}
