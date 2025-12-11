import { Application } from "express";
import { AppConfig, Logger } from ".";
import { ServiceConfig } from "../types";
import { createProxyMidddleware, Options } from "http-proxy-middleware";
import ApiResponse from "../utils";

class ServicesProxy { 

    private static readonly servicesConfig: ServiceConfig[] = [
        { 
            path: "/api/v1/auths",
            url: AppConfig.AUTH_SERVICE_URL,
            pathRewrite: {"^":"/api/v1/auths"},
            name: "auths-srvice",
            timeout: 5000
        }
    ]

    private static handleProxyError(err: Error, req: any, res: any) {
        Logger.error(`Proxy error for ${req.path}: `, err);
        ApiResponse.error(res, 503, {
            message: "Service unavailable",
            timeStamp: new Date().toISOString()
        })
        res.setHeader("Content-Type", "application/json");
    }

    public static setUpProxy(app: Application): void { 
        ServicesProxy.servicesConfig.forEach(service => {
            const proxyOptions = ServicesProxy.createProxyOptions(service);
            app.use(service.path, createProxyMidddleware(proxyOptions));
            Logger.info(`configured proxy for ${service.name} at ${service.path}`);
        })
    }

    private static createProxyOptions(services: ServiceConfig): Options {
        return {
            target: services.url,
            changeOrigin: true,
            pathRewrite: services.pathRewrite,
            timeout: services.timeout ?? 3000,
            logger: Logger,
            on: {
                error: ServicesProxy.handleProxyError,
                proxyReq: ServicesProxy.handleProxyRequest,
                proxyRes: ServicesProxy.handleProxyResponse

            }
        }
    }
}