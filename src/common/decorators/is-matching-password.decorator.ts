import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsMatchingPasswordConstraint } from '../pipes/validators'


export function IsMatchingPassword(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsMatchingPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsMatchingPasswordConstraint
    })
  }
}
