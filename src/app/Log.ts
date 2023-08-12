import log4js from 'log4js';

const getInstance = () =>
  log4js
    .configure({
      appenders: {
        hourly: {
          type: 'dateFile',
          filename: 'logs/trace.log',
          pattern: 'yyyy-MM/yyyy-MM-dd',
          hoursToKeep: 24 * 7,
          maxLogSize: 2,
          keepFileExt: true,
        },
        out: { type: 'stdout' },
      },
      categories: { default: { appenders: ['hourly', 'out'], level: 'info' } },
    })
    .getLogger();

const log = getInstance();

export { log, getInstance };
