import { prisma } from '@/app/Prisma';
import { jwtMiddleware } from '@/app/Server';
import { Paging, Reply } from '@/models';
import { QueryPaging } from '@/models/Paging';
import { getUserToken } from '@/service/User';
import { Prisma } from '@prisma/client';
import { Request } from 'express';
import {
  Body,
  Delete,
  Get,
  JsonController,
  Param,
  Post,
  Put,
  QueryParam,
  Req,
  UseBefore,
} from 'routing-controllers';

@JsonController('/books')
@UseBefore(jwtMiddleware)
export class BookController {
  @Get('/')
  public async list(
    @Req() request: Request,
    @QueryPaging() page: Paging,
    @QueryParam('keyword') keyword: string,
  ) {
    const { id: userId } = getUserToken(request);
    const args: Prisma.BookFindManyArgs = {
      where: {
        userId,
        name: {
          contains: keyword,
        },
      },
      ...page.getPage(),
    };

    const total = await prisma.book.count(args as Prisma.BookCountArgs);
    const result = prisma.book
      .findMany(args)
      .then((res) => page.result(total, res));

    return Reply.promise(result);
  }

  @Get('/:id')
  public async info(@Param('id') id: string) {
    const result = prisma.book.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return Reply.promise(result);
  }

  @Post('/')
  public async create(
    @Req() request: Request,
    @Body({ required: true }) data: Prisma.BookCreateInput,
  ) {
    const { id: userId } = getUserToken(request);
    const { status, name } = data;
    const result = prisma.book
      .create({
        data: {
          userId,
          status,
          name,
        },
      })
      .catch((err) => {
        throw err.code === 'P2002'
          ? new Error('book name already exists.')
          : err;
      });

    return Reply.promise(result);
  }

  @Put('/:id')
  public async update(
    @Param('id') id: string,
    @Body({ required: true })
    data: Prisma.BookUpdateInput,
  ) {
    const { status, name } = data;
    const result = prisma.book.update({
      where: { id },
      data: {
        status,
        name,
      },
    });

    return Reply.promise(result);
  }

  @Delete('/:id')
  public async delete(@Param('id') id: string) {
    const result = prisma.book
      .delete({
        where: { id },
      })
      .then(() => Promise.resolve());

    return Reply.promise(result);
  }
}
