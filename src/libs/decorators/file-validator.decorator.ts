import { IMAGE_TYPES } from '@libs/constants';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isImage', async: false })
export class IsImageConstraint implements ValidatorConstraintInterface {
  validate(file: Express.Multer.File) {
    if (!file) return true;

    // Validate file type
    if (!IMAGE_TYPES.includes(file.mimetype)) {
      return false;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return 'Thumbnail must be a valid image (jpg, jpeg, png) and less than 5MB';
  }
}

export function IsImage(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isImage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsImageConstraint,
    });
  };
}
