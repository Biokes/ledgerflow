import dotenv from "dotenv";
import type { AppConfig } from "../types/index";
import { createClient, RedisClientType } from "redis";
import logger from "../utils/logger";
import { DataSource } from "typeorm";
import { User } from "../data/models";

dotenv.config();

export const appConfig: AppConfig = {
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV!
}

export const redisClient: RedisClientType = createClient({
    url: process.env.REDIS_URL!
})

redisClient.on("error", (err) => logger.error("Redis Client Error", err));

export const connectRedis = async () => {
  await redisClient.connect();
   logger.info(`redis connected`, {
        environment: appConfig.nodeEnv
    })
};

export const Database: DataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_DATABASE as string,
    synchronize: true,
    entities:[User],
    logging: false,
})