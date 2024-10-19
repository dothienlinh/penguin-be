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
}

export enum LikeType {
  POST = 'post',
  COMMENT = 'comment',
}

export enum Permission {
  // USER
  READ_USER = 'read_user',
  WRITE_USER = 'write_user',
  DELETE_USER = 'delete_user',
  UPDATE_USER = 'update_user',

  // POST
  READ_POST = 'read_post',
  WRITE_POST = 'write_post',
  DELETE_POST = 'delete_post',
  UPDATE_POST = 'update_post',
  // COMMENT
  READ_COMMENT = 'read_comment',
  WRITE_COMMENT = 'write_comment',
  DELETE_COMMENT = 'delete_comment',
  UPDATE_COMMENT = 'update_comment',

  // LIKE
  READ_LIKE = 'read_like',
  WRITE_LIKE = 'write_like',
  DELETE_LIKE = 'delete_like',
  UPDATE_LIKE = 'update_like',

  // ROLE
  READ_ROLE = 'read_role',
  WRITE_ROLE = 'write_role',
  DELETE_ROLE = 'delete_role',
  UPDATE_ROLE = 'update_role',

  // SHARE
  READ_SHARE = 'read_share',
  WRITE_SHARE = 'write_share',
  DELETE_SHARE = 'delete_share',
  UPDATE_SHARE = 'update_share',

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

  // MAIL
  READ_MAIL = 'read_mail',
  WRITE_MAIL = 'write_mail',
  DELETE_MAIL = 'delete_mail',
  UPDATE_MAIL = 'update_mail',
}
