const winston = require('winston');
const fs = require('fs');
const logDir = './logs'

winston.emitErrs = true;

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// To get local time
// const tsFormat = () => (new Date()).toLocaleTimeString();

// For UTC time. This is default if you do not specify 'timestamp' variable in Winston config. 
// const tsFormat = () => (new Date());

// Will always convert the Time in EST format
const tsFormat = () => (new Date()).toLocaleString("en-US", {timeZone: "America/New_York"});

var logger = new winston.Logger({
    transports: [
        new (require('winston-daily-rotate-file'))({
            level: 'info',
            filename: `${logDir}/-results.log`,
            handleExceptions: true,
            timestamp: tsFormat,
            datePattern: 'yyyy-MM-dd',
            prepend: true,
            timestamp: tsFormat
        })
    ],
    exitOnError: false
});

// Use Below if you want to log it to console and file both 
/*var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: `${logDir}/results.log`,
            filename: './logs/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            timestamp: tsFormat,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});*/

module.exports = logger;
module.exports.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};