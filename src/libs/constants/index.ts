import { Permission } from '@libs/enums';

export const IS_PUBLIC_KEY = 'isPublic';

export const RESPONSE_MESSAGE = 'response_message';

export const MetadataKey = {
  REDIS: 'redis',
};

export const FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'video/mp4',
  'video/mpeg',
  'video/x-msvideo',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
];

export const UPLOAD_FOLDER = 'uploads';

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const PERMISSIONS_KEY = 'permissions';

export const PERMISSIONS_ADMIN_ONLY = [
  Permission.READ_USER,
  Permission.WRITE_USER,
  Permission.DELETE_USER,
  Permission.READ_POST,
  Permission.WRITE_POST,
  Permission.DELETE_POST,
  Permission.READ_COMMENT,
  Permission.WRITE_COMMENT,
  Permission.DELETE_COMMENT,
  Permission.READ_ROLE,
  Permission.WRITE_ROLE,
  Permission.DELETE_ROLE,
  Permission.READ_SHARE,
  Permission.WRITE_SHARE,
  Permission.DELETE_SHARE,
  Permission.READ_CHAT,
  Permission.WRITE_CHAT,
  Permission.DELETE_CHAT,
  Permission.READ_IMAGE,
  Permission.WRITE_IMAGE,
  Permission.DELETE_IMAGE,
];

export const PERMISSIONS_USER_ONLY = [
  Permission.READ_USER,
  Permission.READ_POST,
  Permission.READ_COMMENT,
  Permission.READ_SHARE,
  Permission.READ_CHAT,
  Permission.READ_IMAGE,
];
