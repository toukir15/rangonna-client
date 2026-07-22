export interface ISignUp {
  name: string;
  phone: string;
  email: string;
  password: string;
  terms?: boolean;
  country_phone_code?: string;
}

export interface ILogin {
  email_phone: string;
  password: string;
}

export interface ICreateStore {
  name: string;
  domain?: any;
}

export interface IVerifyCode {
  code: string;
}
