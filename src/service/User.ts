import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { Request } from 'express';
import { UnauthorizedError } from 'express-jwt';

type UserToken = {
  id: string;
  username: string;
};
const getUserToken = (request: Request, key = 'auth') => {
  const v = request[key] as UserToken;
  if (!v) {
    throw new UnauthorizedError('invalid_token', {
      message: 'context information that does not exist',
    });
  }

  return v;
};

const hashPassword = (password: string) => hashSync(password, genSaltSync(10));
const comparePassword = (
  password: string,
  user: { password: string } | null | undefined,
) => user && compareSync(password, user.password);

export { UserToken, getUserToken, hashPassword, comparePassword };
