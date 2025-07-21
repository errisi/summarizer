export interface IUser {
  id: string;
  name: string;
}

export interface IAuthResponse {
  user: IUser;
  token: string;
}
