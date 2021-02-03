import Sentry from 'winston-transport-sentry-node';
import { createLogger, format, transports } from 'winston';
import { get, isObject } from 'lodash';

import captain from 'captains-log';

const { SPLAT } = require('triple-beam');

function formatObject(param) {
  if (isObject(param)) {
    return JSON.stringify(param);
  }
  return param;
}

const { combine, timestamp, colorize, label, printf, align } = format;

const all = format((info) => {
  const splat = info[SPLAT] || [];
  const message = formatObject(info.message);
  const rest = splat.map(formatObject).join(' ');
  info.message = `${message} ${rest}`;
  return info;
});

const logger = createLogger({
  level: get(sails, 'config.log.level', 'silly'),
  format: combine(
    all(),
    label({ label: get(sails, 'config.version', '-') }),
    timestamp(),
    colorize(),
    align(),
    printf(
      (info) =>
        `${info.timestamp} [${info.label}] ${info.level}: ${formatObject(info.message)}`,
    ),
  ),
  defaultMeta: get(sails, 'config.log.sentry.defaultMeta', {}),
  transports: [new transports.Console()],
  levels: {
    error: 1,
    warn: 2,
    debug: 3,
    info: 4,
    verbose: 5,
    silly: 6,
  },
});

const sentryDsn = get(sails, 'config.log.sentry.dsn', null);

console.log('sentryDsn=>', sentryDsn);
if (sentryDsn) {
  const options = {
    sentry: {
      ...get(sails, 'config.log.sentry', {}),
      dsn: sentryDsn,
    },
    level: get(sails, 'config.log.sentry.level', 'info'),
  };
  logger.add(new Sentry(options));
}

module.exports = function (sails) {
  // const loader = Loader(sails);
  return {
    defaults: {
      __configKey__: {
        // sails-config
        name: 'sails-hook-winston-sentry',
        _exposeToGlobal: true,
        _hookTimeout: 30 * 1000,
        // hook config
        enable: true,
      },
    },
    configure() {},
    initialize(next) {
      sails.config.log = {
        ...sails.config.log,
        inspect: false,
        custom: logger,
      };

      sails.log = captain(sails.config.log);

      return next();
    },
  };
};
