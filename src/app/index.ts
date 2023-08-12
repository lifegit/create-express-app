import { conf } from '@/app/Conf';
import { log } from '@/app/Log';
import { setUp as setUpPrisma } from '@/app/Prisma';
import { setUp as setUpServer } from '@/app/Server';

function Index() {
  setUpPrisma();
  setUpServer();

  const { name, version } = conf.app;
  log.info(`app: ${name} , version: ${version}, at start ...`);
}

export default Index;
