import dotenv from "dotenv";
import type { AppConfig } from "../types/index";
import { createClient, RedisClientType } from "redis";
import logger from "../utils/logger";
import { DataSource } from "typeorm";
import { User } from "../data/models";
import { Server } from "http";
import { Application } from "express";

dotenv.config();

export const appConfig: AppConfig = {
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV!
}

export const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL!
})

redisClient.on("error", (err) => logger.error("Redis Client Error", err));
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function initializeRedis(): Promise<void> {
    const maxRetries = 3;
    const baseDelay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await redisClient.connect();
            logger.info('Redis connected successfully');
            return;
        } catch (error: any) {
            if (attempt === maxRetries) {
                logger.warn('Redis connection failed, continuing without cache', { error: error.message });
                return;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            logger.warn(`Redis connection attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
}

export const Database: DataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    synchronize: true,
    entities: [User],
    logging: false,
})

export async function initializeDatabase(): Promise<void> {
    const maxRetries = 5;
    const baseDelay = 2000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await Database.initialize();
            logger.info('Database connected successfully');
            return;
        } catch (error: any) {
            if (attempt === maxRetries) {
                logger.error('Database connection failed after all retries', { error: error.message });
                throw error;
            }
            const delay = baseDelay * Math.pow(2, attempt - 1);
            logger.warn(`Database connection attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`);
            await sleep(delay);
        }
    }
}

export async function gracefulShutdown(signal: string, server: Server): Promise<void> {
    logger.info(`${signal} received, starting graceful shutdown...`);
    server.close(() => {
        logger.info('HTTP server closed');
    });
    try {
        if (Database.isInitialized) {
            await Database.destroy();
            logger.info('✅ Database connection closed');
        }
    } catch (error: any) {
        logger.error('❌ Error closing database: ', { error: error.message });
    }
    try {
        if (redisClient.isOpen) {
            await redisClient.quit();
            logger.info('Redis connection closed');
        }
    } catch (error: any) {
        logger.error('Error closing Redis: ', { error: error.message });
    }
    process.exit(0);
}

export async function bootstrap(app: Application): Promise<void> {
    try {
        logger.info('Initializing LedgerFlow application...', {
            environment: appConfig.nodeEnv,
            port: appConfig.port
        });
        await initializeDatabase();
        await initializeRedis();

        const server = app.listen(appConfig.port, () => {
            logger.info(`Server started successfully`, {
                port: appConfig.port,
                environment: appConfig.nodeEnv,
                url: `http://localhost:${appConfig.port}`
            });
        });
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM', server));
        process.on('SIGINT', () => gracefulShutdown('SIGINT', server));
    } catch (error: any) {
        logger.error('Failed to start application', {
            error: error.message,
            stack: error.stack
        });
        process.exit(1);
    }
}