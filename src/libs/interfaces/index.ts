export interface RedisType {
  key: string;
  value: string | number;
  expired: number;
}

export interface Payload {
  sub: number;
  sessionId: string;
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

export interface ResultDataList<T> {
  result: T[];
  meta: {
    totalPage: number;
    currentPage: number;
    pageSize: number;
    totalRecords: number;
  };
}
