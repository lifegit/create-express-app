import { conf } from '@/app/Conf';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;
const setUp = () => {
  if (prisma) return prisma;
  prisma = getInstance();
};

const getInstance = () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: conf.db.URL,
      },
    },
  });

  prisma.$use(async (params, next) => {
    // soft delete: https://www.prisma.io/docs/concepts/components/prisma-client/middleware/soft-delete-middleware
    if (params.action == 'delete') {
      params.action = 'update';
      setDeepProperty(params, 'args.data.deletedAt', new Date());
    }
    if (params.action == 'deleteMany') {
      params.action = 'updateMany';
      setDeepProperty(params, 'args.data.deletedAt', new Date());
    }

    if (['findUnique', 'findFirst'].includes(params.action)) {
      params.action = 'findFirst';
      setDeepProperty(params, 'args.where.deletedAt', { equals: null });
    }
    if (['findMany', 'count'].includes(params.action)) {
      setDeepProperty(params, 'args.where.deletedAt', { equals: null });
    }

    return next(params);
  });

  return prisma;
};

function setDeepProperty(obj, propertyPath, value) {
  const properties = propertyPath.split('.');
  const lastProp = properties.pop();

  properties.reduce((nestedObj, prop) => {
    if (!nestedObj[prop]) {
      nestedObj[prop] = {};
    }
    return nestedObj[prop];
  }, obj)[lastProp] = value;
}

export { prisma, setUp, getInstance, setDeepProperty };
