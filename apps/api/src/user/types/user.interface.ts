export interface ICreateUser {
  userName?: string;
  password?: string;
  mobile?: string;
  email?: string;
}

export interface IUserDuplicateCheck {
  key: SearchKeys;
  value: string;
}

export interface IUserName {
  userName: string;
}
export type SearchKeys = 'userName';
