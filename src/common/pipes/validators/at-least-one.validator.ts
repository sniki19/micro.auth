import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'


@ValidatorConstraint({ name: 'AtLeastOne', async: false })
export class AtLeastOneConstraint implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments) {
    const object = args.object as Record<string, unknown>
    const fields = args.constraints as string[]
    return fields.some(field => {
      const fieldValue = object[field]
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
    })
  }

  defaultMessage(args: ValidationArguments) {
    const fields = args.constraints as string[]
    return `Должно быть заполнено хотя бы одно из полей: ${fields.join(', ')}`
  }
}
