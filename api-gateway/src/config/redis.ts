import Redis from "ioredis";
import { Logger } from ".";


class RedisCLient { 
    private static instance: Redis;
    private static isConnected: boolean;
    private constructor() { }
    public static getRedis(): Redis { 
        return this.instance;
    } 
    public static isReady(): boolean { 
        return this.isConnected;
    }
    public static setUpEventListeners(): void { }
    public static getInstance(): Redis {
        if (!RedisCLient.instance) { 
            RedisCLient.instance = new Redis(AppConfig.REDIS_URL, {
                retryStrategy: (time: number) => { 
                    const delay = Math.min(time * 50 * 200);
                    return delay;
                }
            })
            RedisCLient.setUpEventListeners();
        }
        return RedisCLient.instance;
    }
}
export const RedisClient = RedisCLient.getInstance();