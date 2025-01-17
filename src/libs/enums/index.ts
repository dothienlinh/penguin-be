export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum Provider {
  EMAIL = 'email',
  FACEBOOK = 'facebook',
  GOOGLE = 'google',
}

export enum Roles {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  USER = 'user',
}

export enum RedisKey {
  OTP_VERIFICATION = 'OTP_VERIFICATION',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  RESET_PASSWORD = 'RESET_PASSWORD',
  OTP_REGISTER = 'OTP_REGISTER',
  USER_SOCKET = 'USER_SOCKET',
  REFRESH_TOKEN = 'REFRESH_TOKEN',
  SESSION_ID = 'SESSION_ID',
}

export enum PostStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELETED = 'deleted',
}

export enum UpdatePostStatus {
  APPROVED = PostStatus.APPROVED,
  REJECTED = PostStatus.REJECTED,
}

export enum ImageType {
  AVATAR = 'avatar',
  THUMBNAIL = 'thumbnail',
  IMAGE = 'image',
}

export enum LikeType {
  POST = 'post',
  COMMENT = 'comment',
}

export enum OrderBy {
  DESC = 'DESC',
  ASC = 'ASC',
}

export enum Permission {
  // ADMIN USER
  ADMIN_GET_USERS = 'admin_get_users',
  ADMIN_GET_USER_DETAIL = 'admin_get_user_detail',
  ADMIN_DELETE_USER = 'admin_delete_user',
  ADMIN_RESTORE_USER = 'admin_restore_user',
  ADMIN_UPDATE_USER_PERMISSION = 'admin_update_user_permission',

  // ADMIN POST
  ADMIN_DELETE_POST = 'admin_delete_post',
  ADMIN_RESTORE_POST = 'admin_restore_post',
  ADMIN_GET_POST_DETAIL = 'admin_get_post_detail',
  ADMIN_GET_POSTS = 'admin_get_posts',
  ADMIN_GET_POSTS_OF_USER = 'admin_get_posts_of_user',

  // USER
  READ_USER = 'read_user',
  WRITE_USER = 'write_user',
  DELETE_USER = 'delete_user',
  UPDATE_USER = 'update_user',
  USER_HAS_PERMISSION = 'user_has_permission',

  // POST
  CREATE_POST = 'create_post',
  DELETE_POST = 'delete_post',
  UPDATE_POST = 'update_post',
  UPDATE_STATUS_POST = 'update_status_post',
  UPDATE_TO_DRAFT = 'update_to_draft',
  READ_PENDING_POST = 'read_pending_post',
  PERMANENTLY_DELETE_POST = 'permanently_delete_post',

  // COMMENT
  CREATE_COMMENT = 'create_comment',
}

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  USERNAME = 'username',
  EMAIL = 'email',
}

export enum UserStatusQuery {
  ALL = '',
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export enum ByRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum NotificationType {
  POST = 'post',
  COMMENT = 'comment',
  LIKE = 'like',
  FOLLOW = 'follow',
  MESSAGE = 'message',
  SYSTEM = 'system',
  REPORT = 'report',
  REPLY_COMMENT = 'reply_comment',
  REPLY_MESSAGE = 'reply_message',
}

export enum FolderUpload {
  POSTS = 'posts',
  AVATARS = 'avatars',
}
