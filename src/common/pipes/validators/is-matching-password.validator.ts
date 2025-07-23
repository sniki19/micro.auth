import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'


@ValidatorConstraint({ name: 'IsMatchingPassword', async: false })
export class IsMatchingPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): Promise<boolean> | boolean {
    const relatedPropertyName = args.constraints[0] as string
    const relatedValue = (args.object as Record<string, string>)[relatedPropertyName]
    return value === relatedValue
  }

  defaultMessage(args: ValidationArguments) {
    const relatedPropertyName = args.constraints[0] as string
    return `${args.property} должен совпадать с ${relatedPropertyName}`
  }
}
