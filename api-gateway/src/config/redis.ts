import Redis from "ioredis";
import { Logger } from ".";

class RedisCLient {
	private static instance: Redis;
	private static isConnected: boolean;
	private constructor() {}
	public static getRedis(): Redis {
		return this.instance;
	}
	public static isReady(): boolean {
		return this.isConnected;
	}
	public static setUpEventListeners(): void {
        RedisCLient.instance.on("error", (err) => {
            RedisCLient.isConnected = false;
            Logger.error("Redis Client Error: ", err);
        });
        
        RedisCLient.instance.on("connect", () => {
            RedisCLient.isConnected = true;
            Logger.info("Redis Client Connected.");
        });

        RedisCLient.instance.on("close", () => {
            RedisCLient.isConnected = false;
			Logger.info("Redis Client cpnnection closed")
        });
        
        RedisCLient.instance.on("reconnecting", () =>
            Logger.info("Redis Client Reconnecting.");
		);
	}

	public static getInstance(): Redis {
		if (!RedisCLient.instance) {
			RedisCLient.instance = new Redis(AppConfig.REDIS_URL, {
				retryStrategy: (time: number) => {
					const delay = Math.min(time * 50 * 200);
					return delay;
				}
			});
			RedisCLient.setUpEventListeners();
		}
		return RedisCLient.instance;
	}
}
export const RedisClient = RedisCLient.getInstance();
