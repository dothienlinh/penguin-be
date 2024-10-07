import { HttpException, HttpStatus } from '@nestjs/common';

export class ChatRoomNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Chat room with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class MessageNotFoundException extends HttpException {
  constructor(id: string) {
    super(`Message with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedChatAccessException extends HttpException {
  constructor() {
    super(
      'You are not authorized to access this chat room',
      HttpStatus.FORBIDDEN,
    );
  }
}

export class InvalidMessageFormatException extends HttpException {
  constructor() {
    super('Invalid message format', HttpStatus.BAD_REQUEST);
  }
}

export class ChatRoomCreationFailedException extends HttpException {
  constructor() {
    super('Failed to create chat room', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class MessageSendFailedException extends HttpException {
  constructor() {
    super('Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class WebSocketConnectionFailedException extends HttpException {
  constructor() {
    super(
      'Failed to establish WebSocket connection',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class UserNotFoundException extends HttpException {
  constructor(id: number) {
    super(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
  }
}
