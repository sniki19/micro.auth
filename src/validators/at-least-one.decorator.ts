import { registerDecorator, ValidationOptions } from 'class-validator'
import { AtLeastOneConstraint } from './at-least-one.validator'


export function AtLeastOne(fields: string[], validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'AtLeastOne',
      target: object.constructor,
      propertyName: propertyName,
      constraints: fields,
      options: validationOptions,
      validator: AtLeastOneConstraint
    })
  }
}
