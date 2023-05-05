import { Serializer } from "ts-japi";

export interface LoginCreds {
  username?: string;
  password?: string;
}

const LoginSerializer = new Serializer<LoginCreds>("auth");

export default LoginSerializer;
