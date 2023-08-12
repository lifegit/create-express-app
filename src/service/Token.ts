import { conf } from '@/app/Conf';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const Bearer = 'Bearer ';

/**
 * 创建 token
 * @param payload 数据载荷
 * @returns token
 */
const create = <T extends string | Buffer | object>(payload: T): string => {
  const { secret, expireHour } = conf.jwt;
  const token = jwt.sign(payload, secret, {
    expiresIn: `${expireHour}h`,
  });
  return `${Bearer}${token}`;
};

/**
 * 解析系统登录用户的token信息
 * @param token token字符串
 * @returns Jwt | JwtPayload | string
 */
const parse = <T extends object>(token: string): T & JwtPayload => {
  if (token.startsWith(Bearer)) {
    token = token.replace(Bearer, '');
  }
  const { secret } = conf.jwt;
  return jwt.verify(token, secret) as T;
};

export { create, parse };
