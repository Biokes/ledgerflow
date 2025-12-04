import { Router, Request, Response } from "express";
import { authRouter } from "./auth.route";

export const AppRouter: Router = Router();

AppRouter.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

AppRouter.use('/auths', authRouter);