import express, { Application } from "express";
import { AppRouter } from "./router";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { RATE_LIMIT_MS } from "./utils";

dotenv.config();

const app: Application = express();

app.use(
	cors({
		origin: [process.env.FRONTEND_URL!],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true
	})
);

app.use(
	rateLimit({
		message: "Too many requests",
		max: 100,
		windowMs: RATE_LIMIT_MS,
		statusCode: 429
	})
);


app.use(express.json());
app.use("/", AppRouter);
