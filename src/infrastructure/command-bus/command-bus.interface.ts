import { ICommand } from '@nestjs/cqrs'


export abstract class ICommandBus {
  abstract execute<T extends ICommand, R = any>(command: T): Promise<R>

  abstract dispatch<T extends ICommand>(command: T): Promise<string>
}
