import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsEmailOrPhoneConstraint } from './email-or-phone.validator'


export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsEmailOrPhone',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsEmailOrPhoneConstraint
    })
  }
}
