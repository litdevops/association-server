const { createLogger, transports, format } = require("winston"),
  Mail = require("winston-mail").Mail,
  Sentry = require("winston-sentry");
require("dotenv").config();
const { NODE_ENV, SENTRY_DSN } = process.env;
const payload = [];

if (NODE_ENV == "production" && SENTRY_DSN) {
  payload.push(
    new Sentry({
      level: "warn",
      dsn: "{{ YOUR SENTRY DSN }}",
      tags: { key: "value" },
      extra: { key: "value" },
    })
  );
} else {
  // add to sentry if in production
  payload.push(
    new transports.Console({
      level: "debug",
      format: format.combine(format.timestamp(), format.json()),
    })
  );
}

const logger = createLogger({
  transports: payload,
});

// change global console.log to winston logger type

module.exports = logger;
