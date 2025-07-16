import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator'


export function IsMatchingPassword(property: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsMatchingPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string
          const relatedValue = (args.object as Record<string, string>)[relatedPropertyName]
          return value === relatedValue
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints[0] as string
          return `${args.property} должен совпадать с ${relatedPropertyName}`
        }
      }
    })
  }
}
