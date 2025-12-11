import winston from "winston";


export const AppConfig = {
    PORT: Number(process.env.PORT!),
    LOG_LEVEL: process.env.NODE_ENV!=="production"? "info":"debug",
    SERVICE_NAME: require("../../package.json").name,
	RATE_LIMIT_MS: 15 * 60 * 1_000,
	AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL!,
}

export const Logger = winston.createLogger({
	level: AppConfig.LOG_LEVEL,
	defaultMeta: {
		service: AppConfig.SERVICE_NAME
	},
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.printf(({ level, message, timestamp, services }) => {
			return `[${timestamp}] [${level}] [${services}]: ${message}`
		})
	),
	transports: [
		new _transports.Console({
			format: _format.combine(
				_format.colorize(),
				_format.printf(
					(info) => `[${info.timestamp}] [${info.level}]: ${info.message}`
				)
			)
		}),
		new _transports.File({ filename: "logs/error.log", level: "error" }),
		new _transports.File({ filename: "logs/combined.log" })
	]
});

