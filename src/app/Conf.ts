import fs from 'fs';
import path from 'path';
import toml from 'toml';

type AppConfig = {
  app: {
    name: string;
    version: number;
  };
  server: {
    addr: string;
    port: number;
    limit: string;
    prefix: string;
  };
  jwt: {
    secret: string;
    expireHour: number;
  };
  db: {
    provider: string;
    URL: string;
    errorFormat: string;
  };
  engine: {
    BASE_URL: string;
  };
};

const isDEV = (): boolean => process.env.NODE_ENV === 'development';

const getInstance = (): AppConfig => {
  const getConfByArgs = () => {
    const args = process.argv.slice(2);
    const idx = args.indexOf('-c');
    return args[idx + 1] ?? '';
  };
  const getConfByEnv = () => {
    const env = isDEV() ? 'dev' : 'prod';
    return path.join(__dirname, '../../', 'conf', `.${env}.toml`);
  };

  const file = getConfByArgs() || getConfByEnv();
  const content = fs.readFileSync(file, 'utf-8');

  return toml.parse(content);
};

const conf = getInstance();

export { AppConfig, conf, isDEV, getInstance };
