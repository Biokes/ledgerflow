import { NextFunction, Request, Response } from "express";
import { userService } from "../services/user.service";
import { LoginDTO, RegisterDTO } from "../types/schema";
import ApiResponse from "../utils/ApiResponse";
import LedgerFlowException from "../exceptions";

class Authcontroller {
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const registerationResult = await userService.register(req.body as RegisterDTO);
            return ApiResponse.success(res,registerationResult,201,'user registerations successful')
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
              res.cookie("token", loginResult.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });
            return ApiResponse.success(res,loginResult,200,'Logged in successfully')
        } catch (error: any) {
            if (error instanceof LedgerFlowException) {
                return ApiResponse.error(res, 400, error);
            }
           return next(error);
        }
    }
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const isLoggesOut = await userService.logout(req, res);
            if (isLoggesOut) return ApiResponse.success(res, { message: "Logged out sucessfully" }, 200);   
        } catch (error) { 
             if (error instanceof LedgerFlowException) {
                return ApiResponse.error(res, 400, error);
            }
           return next(error);
        }
    }
}

export const authController = new Authcontroller();
