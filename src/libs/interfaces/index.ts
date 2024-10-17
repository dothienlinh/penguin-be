export interface RedisType {
  key: string;
  value: string | number;
  expired: number;
}

export interface Payload {
  sub: number;
  iat?: number;
  exp?: number;
}

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
