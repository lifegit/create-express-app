import { prisma } from '@/app/Prisma';
import { jwtMiddleware } from '@/app/Server';
import { Reply } from '@/models';
import { create, parse } from '@/service/Token';
import {
  comparePassword,
  getUserToken,
  hashPassword,
  UserToken,
} from '@/service/User';
import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';
import { Request, Response } from 'express';
import {
  Body,
  Get,
  JsonController,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseBefore,
} from 'routing-controllers';
import * as svgCaptcha from 'svg-captcha';

class LoginRequest {
  @IsString()
  @IsNotEmpty()
  public username;

  @IsString()
  @IsNotEmpty()
  public password;

  @IsString()
  public code;

  @IsString()
  public key;
}

export type CaptchaToken = {
  text: string;
};

@JsonController('/account')
export class Account {
  @Post('/login')
  public async login(@Body() { username, password, code, key }: LoginRequest) {
    // check captcha
    if (key) {
      const { text } = parse<CaptchaToken>(key);
      if (text?.toLowerCase() !== code?.toLowerCase()) {
        return Reply.error('验证码错误');
      }
    }

    // check user
    const user = await prisma.user.findUnique({ where: { username } });
    if (!comparePassword(password, user)) {
      return Reply.error('账户或密码错误');
    }
    const token = create<UserToken>({ id: user!.id, username: user!.username });

    return Reply.success({ token });
  }

  @Get('/captcha')
  public async code(@Res() resp: Response) {
    const { data, text } = svgCaptcha.create();
    const captchaToken = create<CaptchaToken>({ text });

    resp.setHeader('captcha-key', captchaToken);
    resp.setHeader('Content-Type', 'image/svg+xml');

    return resp.send(data);
  }

  @Get('/')
  @UseBefore(jwtMiddleware)
  public async info(@Req() request: Request) {
    const { id } = getUserToken(request);
    const result = prisma.user
      .findUnique({
        where: { id },
      })
      .then((res) => (res ? { ...res, password: '' } : undefined));

    return Reply.promise(result);
  }

  @Post('/')
  public async create(@Body({ required: true }) data: Prisma.UserCreateInput) {
    const { status, username, password, nickname } = data;
    const result = prisma.user
      .create({
        data: {
          status,
          username,
          nickname,
          password: hashPassword(password),
          avatar: '',
        },
      })
      .then((res) => ({ ...res, password: '' }));

    return Reply.promise(result);
  }

  @Put('/')
  @UseBefore(jwtMiddleware)
  public async update(
    @Req() request: Request,
    @Body({ required: true })
    body: Prisma.UserUpdateInput & { oldPassword: string },
  ) {
    const { id } = getUserToken(request);
    // permissible change
    const { status, nickname } = body;
    const data: Prisma.UserUpdateInput = {
      status,
      nickname,
    };
    // change Password
    const { oldPassword, password } = body;
    if (oldPassword && password) {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!comparePassword(oldPassword, user)) {
        return Reply.error('账户或密码错误');
      }

      Object.assign(data, { password: hashPassword(password.toString()) });
    }
    // update
    const result = prisma.user
      .update({
        where: { id },
        data,
      })
      .then((res) => ({ ...res, password: '' }));

    return Reply.promise(result);
  }

  @Post('/avatar')
  @UseBefore(jwtMiddleware)
  public async avatar(
    @Req() request: Request,
    @UploadedFile('file', {
      required: true,
      options: { limits: { fileSize: 1024 * 1024 * 5 } },
    })
    files,
  ) {
    const { id } = getUserToken(request);
    const upload = () => {
      // ...saving files
      return `https://avater.com/${id}/${files.name}`;
    };
    const avatar = upload();
    return Reply.success({ avatar });
  }
}
