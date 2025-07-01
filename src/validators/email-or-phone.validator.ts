import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator'


@ValidatorConstraint({ name: 'IsEmailOrPhone', async: false })
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): Promise<boolean> | boolean {
    const obj = args.object as { email?: string, phone?: string }
    return !!(obj.email || obj.phone)
  }

  defaultMessage(_args: ValidationArguments) {
    return 'Должен быть указан email или телефон'
  }
}
