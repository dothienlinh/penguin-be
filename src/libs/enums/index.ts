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
  WRITE_POST = 'write_post',
  DELETE_POST = 'delete_post',
  UPDATE_POST = 'update_post',
  UPDATE_STATUS_POST = 'update_status_post',
  UPDATE_TO_DRAFT = 'update_to_draft',
  READ_PENDING_POST = 'read_pending_post',
  PERMANENTLY_DELETE_POST = 'permanently_delete_post',

  // COMMENT
  CREATE_COMMENT = 'create_comment',

  // ROLE
  READ_ROLE = 'read_role',
  WRITE_ROLE = 'write_role',
  DELETE_ROLE = 'delete_role',
  UPDATE_ROLE = 'update_role',

  // CHAT
  READ_CHAT = 'read_chat',
  WRITE_CHAT = 'write_chat',
  DELETE_CHAT = 'delete_chat',
  UPDATE_CHAT = 'update_chat',

  // IMAGE
  READ_IMAGE = 'read_image',
  WRITE_IMAGE = 'write_image',
  DELETE_IMAGE = 'delete_image',
  UPDATE_IMAGE = 'update_image',

  // PERMISSION
  READ_PERMISSION = 'read_permission',
  WRITE_PERMISSION = 'write_permission',
  DELETE_PERMISSION = 'delete_permission',
  UPDATE_PERMISSION = 'update_permission',

  // CATEGORY
  READ_CATEGORY = 'read_category',
  WRITE_CATEGORY = 'write_category',
  DELETE_CATEGORY = 'delete_category',
  UPDATE_CATEGORY = 'update_category',
}

export enum SortBy {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  USERNAME = 'username',
  EMAIL = 'email',
}

export enum UserStatusQuery {
  ALL = 'all',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  DELETED_BY_ADMIN = 'deletedByAdmin',
  DELETED_BY_USER = 'deletedByUser',
}

export enum ByRole {
  ADMIN = 'admin',
  USER = 'user',
}
