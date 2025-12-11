import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user.service";
import { LoginDTO, RegisterDTO } from "../types/schema";
import ApiResponse from "../utils/ApiResponse";
import LedgerFlowException from "../exceptions";
import { ONE_DAY, ONE_WEEK } from "../utils";

class Authcontroller {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("start i")
            const registerationResult = await userService.register(req.body as RegisterDTO);
            return ApiResponse.success(res, registerationResult, 201, 'user registerations successful')
        } catch (error: any) {
            if (error instanceof LedgerFlowException) {
                return ApiResponse.error(res, 400, error);
            }
            return next(error);
        }
    }

   async login(req: Request, res: Response, next: NextFunction) {
        try {
            const loginResult = await userService.login(req.body as LoginDTO);
            if (loginResult.alreadyLoggedIn) return ApiResponse.error(res, 400, "User already logged in");
            res.cookie("accessToken", loginResult.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: ONE_DAY
            });
            res.cookie("refreshToken", loginResult.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: ONE_WEEK
            });
            return ApiResponse.success(res, { user: loginResult.user }, 200, 'Logged in successfully');
        } catch (error: any) {
            if (error instanceof LedgerFlowException) {
                return ApiResponse.error(res, 400, error);
            }
            return next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const incomingRefreshToken = req.cookies.refreshToken;
            const result = await userService.refreshToken(incomingRefreshToken);
            res.cookie("accessToken", result.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: ONE_WEEK,
            });
            return ApiResponse.success(res, { message: "Token refreshed successfully" }, 200);
        } catch (error: any) {
            if (error instanceof LedgerFlowException) {
                return ApiResponse.error(res, 401, error);
            }
            return next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const isLoggedOut = await userService.logout(req, res);
            if (isLoggedOut) return ApiResponse.success(res, { message: "Logged out successfully" }, 200);
        } catch (error) {
            if (error instanceof LedgerFlowException) {
                return ApiResponse.error(res, 400, error);
            }
            return next(error);
        }
    }
}

export const authController = new Authcontroller();
