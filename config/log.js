/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */

import Sentry from 'winston-transport-sentry-node';
import { createLogger, format, transports } from 'winston';
import { get, isObject } from 'lodash';

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
        `${info.timestamp} [${info.label}] ${info.level}: ${formatObject(
          info.message,
        )}`,
    ),
  ),
  defaultMeta: get(sails, 'config.log.sentry.defaultMeta', {}),
  transports: [new transports.Console()],
});

const sentryDsn = get(sails, 'config.log.sentry.dsn', null);
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

module.exports.log = {
  /** *************************************************************************
   *                                                                          *
   * Valid `level` configs: i.e. the minimum log level to capture with        *
   * sails.log.*()                                                            *
   *                                                                          *
   * The order of precedence for log levels from lowest to highest is:        *
   * silly, verbose, info, debug, warn, error                                 *
   *                                                                          *
   * You may also set the level to "silent" to suppress all logs.             *
   *                                                                          *
   ************************************************************************** */

  level: 'silly',

  inspect: !sentryDsn,

  custom: sentryDsn ? logger : undefined,

  winston: {
    defaultMeta: null,
  },

  sentry: {
    dsn: null,
  },
};
