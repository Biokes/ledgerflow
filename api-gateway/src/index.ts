import express, { Application, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { AppConfig, Logger } from "./config";

const App: Application = express();

App.use(helmet());
App.use(cors());
App.use()
App.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({ status: "OK" });
});

App.use((_req: Request, res: Response) => {
	res.status(404).json({ message: "RESOURCE NOT FOUND" });
});


App.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
	Logger.error("Unhandled error: ", err);
    res.status(500).json({ message: "INTERNAL SERVER ERROR" });
});

const startServer = () => { 
    try {
        App.listen(AppConfig.PORT, () => {
            Logger.info(`${AppConfig.SERVICE_NAME} running on port ${AppConfig.PORT}`)
        })
    } catch (error) { 
        Logger.error("Failed to start server: ", error);
        process.exit(1);
    }
}

startServer();