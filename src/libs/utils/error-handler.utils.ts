import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

export class ErrorHandler {
  static handle(error: any, message?: string): never {
    if (error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof UnauthorizedException) {
      throw error;
    }

    if (error instanceof ForbiddenException) {
      throw error;
    }

    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof ConflictException) {
      throw error;
    }

    if (error instanceof QueryFailedError) {
      throw new InternalServerErrorException('Database operation failed');
    }

    console.error(`${message || 'Unhandled error'}:`, error);

    throw new InternalServerErrorException(
      message || 'An unexpected error occurred',
    );
  }
}
