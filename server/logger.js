const process = require("process");
const winston = require("winston");
const {combine, timestamp } = winston.format;

function trimNewline() {
  return {
    transform: (msg) => {
      if(msg.message)
        msg.message = msg.message.trim();
      return msg;
    }
  };
}

function createDevLogger() {
  return new winston.createLogger({
    format: combine(timestamp(), trimNewline(), winston.format.json()),
    transports: [
      new winston.transports.Console({
        colorize: true,
      })
    ]
  });
}

function createProdLogger() {
 return winston.createLogger({
    format: combine(timestamp(), trimNewline(), winston.format.json()),
    transports: [
      new winston.transports.Console({
        colorize: false,
        level: "error"
      }),
      new winston.transports.File({
        filename: 'log/production.log'
      })
    ],
  });
}

function createLogger() {
  return process.env.NODE_ENV == 'production' ? createProdLogger() : createDevLogger();
}

module.exports = createLogger();
