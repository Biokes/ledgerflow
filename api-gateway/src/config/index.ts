import winston from "winston";

export const Logger = winston.createLogger({
	level: AppConfig.LOG_LEVEL,
	defaultMeta: {
		service: AppConfig.SERVICE_NAME
	},
	format: _format.combine(
		_format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
		_format.errors({ stack: true }),
		_format.splat(),
		_format.json()
	),
	transports: [
		new _transports.Console({
			format: _format.combine(
				_format.colorize(),
				_format.printf(
					(info) => `${info.timestamp} ${info.level}: ${info.message}`
				)
			)
		}),
		new _transports.File({ filename: "logs/error.log", level: "error" }),
		new _transports.File({ filename: "logs/combined.log" })
	]
});
