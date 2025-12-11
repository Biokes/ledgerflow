import rateLimit from "express-rate-limit";
import { AppConfig } from "../config";

export const Limit = rateLimit({
	message: "Too many requests",
	max: 100,
	windowMs: AppConfig.RATE_LIMIT_MS,
	statusCode: 429
});
