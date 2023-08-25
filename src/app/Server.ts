import { conf, isDEV } from '@/app/Conf';
import { log } from '@/app/Log';
import { Reply } from '@/models';
import bodyParser from 'body-parser';
import express, { Express, Request, Response } from 'express';
import { expressjwt } from 'express-jwt';
import morgan from 'morgan';
import path from 'path';
import 'reflect-metadata';
import { useExpressServer } from 'routing-controllers';

let server: Express;
const setUp = () => {
  if (server) return server;
  server = getInstance();
};

const getInstance = () => {
  // 1. basic information
  const app = express();
  const { addr, port, limit, prefix } = conf.server;
  const dev = isDEV();
  const url = `${addr}:${port}`;
  const basePath = path.join(__dirname, '../');

  // 2. setup middleware
  app.use(morgan(process.env.NODE_ENV));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  /// cross
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.header('origin') ?? '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type,Content-Length, Authorization,Origin,Accept,X-Requested-With',
    );
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('X-Powered-By', ' 1.0.1');
    res.header('Content-Type', 'application/json;charset=utf-8');
    res.header(
      'P3P',
      'CP=CURa ADMa DEVa PSAo PSDo OUR BUS UNI PUR INT DEM STA PRE COM NAV OTC NOI DSP COR',
    );
    // res.header("P3P","CP=CAO PSA OUR");

    req.method === 'OPTIONS' ? res.send(200) : next();
  });
  /// post body big data
  app.use(bodyParser.urlencoded({ limit, extended: true }));
  app.use(bodyParser.json({ limit }));
  /// staticPath
  app.use(express.static(path.join(basePath, 'public')));
  log.info(
    `visit ${url} for front-end static html files. example: ${url}/favicon.ico`,
  );
  /// appInfo
  if (dev) {
    log.info(`visit ${url}/app/info' for app info only on not-prod mode`);
    app.use('/app/info', (req: Request, res: Response) => {
      res.json({ env: process.env, conf });
    });
  }
  /// route
  useExpressServer(app, {
    routePrefix: prefix,
    defaultErrorHandler: false,
    controllers: [path.join(basePath, 'controllers', '*{.js,.ts}')],
  });
  /// notRoute
  app.use((req, res) => {
    if (res.headersSent) return;
    res.status(404).json(Reply.error('Not Found'));
  });
  /// errorHandler
  app.use((err, req, res, _) => {
    if (err.name === 'UnauthorizedError') {
      return res.status(401).json(Reply.error('Invalid token'));
    }

    const errMsg = Reply.errorWithData(
      dev ? err.stack : undefined,
      err.message,
    );
    res.status(err.httpCode ?? 200).json(errMsg);
  });

  // 3. listen
  app
    .listen(port, function () {
      log.info(`the server is start: ${url}`);
    })
    .on('error', (error) => {
      log.error(error);
      process.exit(1);
    });

  return app;
};

const jwtMiddleware = expressjwt({
  secret: conf.jwt.secret,
  algorithms: ['HS256'],
});

export { server, jwtMiddleware, setUp, getInstance };
