import dotenv from "dotenv";
import type { AppConfig } from "../types/index";
dotenv.config();

export const appConfig: AppConfig = {
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV!
}
