import express, { Application, Request, Response, NextFunction } from "express";
import { AppRouter } from "./router";
import { errorHandler } from "./middleware/errorHandler";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { RATE_LIMIT_MS } from "./utils";

dotenv.config();

const app: Application = express();
app.use(
	rateLimit({
		message: "Too many requests",
		max: 100,
		windowMs: RATE_LIMIT_MS,
		statusCode: 429
	})
);

app.use(
	cors({
		origin: [process.env.FRONTEND_URL!],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true
	})
);

app.use(express.json());
app.use("/", AppRouter);

app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		statusCode: 404,
		message: `Route ${req.method} ${req.path} not found`,
		timestamp: new Date().toISOString()
	});
});

app.use(errorHandler);

export default app;