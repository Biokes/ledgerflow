import { UserRepository, userRepository } from './../data/repositories/userRepository';
import { redisClient } from "../config";
import LedgerFlowException from "../exceptions";
import { EMAIL_ALREADY_EXIST, INVALID_DETAILS_PROVIDED, NO_SESSION_FOUND } from "../exceptions/constants";
import { LoginDTO, RegisterDTO } from "../types/schema";
import dotenv from "dotenv";
import bcrypt from "bcrypt"
import { UserRole } from '../types';
import jwt from "jsonwebtoken";
import { User } from '../data/models';
import { Request, Response } from 'express';

dotenv.config();

class UserService {

    private readonly userRepository: UserRepository;

    constructor() {
        this.userRepository = userRepository;
    }

    async register(dto: RegisterDTO) {
        const existingUser = await redisClient.get(`user:email:${dto.email.toLowerCase()}`);
        await this.validateEmailExistence(existingUser, dto);
        const hashedPassword: string = await bcrypt.hash(dto.password, Number(process.env.PASSWORD_HASH!))
        const user = await userRepository.create({ name: dto.name, password: hashedPassword, email: dto.email.toLowerCase(), role: UserRole.USER })
        const userResponse = { email: user.email, name: user.name, id: user.id, createdAt: user.createdAt }
        await this.cacheUserToRedis(userResponse);
        return userResponse
    }

    async login(dto: LoginDTO) {
        const userFound = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
        if (!userFound) throw new LedgerFlowException(INVALID_DETAILS_PROVIDED);
        const isValidPassword = await bcrypt.compare(dto.password, userFound.password);
        if (!isValidPassword) throw new LedgerFlowException(INVALID_DETAILS_PROVIDED);
        const existingToken = await redisClient.get(`user:token:${userFound.id}`);
        if (existingToken) return { alreadyLoggedIn: true, token: existingToken };
        const token = await this.signAndCacheLoginToken(userFound);
        const refreshToken = jwt.sign({ userId: userFound.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
        await redisClient.setEx(`user:refresh:${userFound.id}`, 7 * 24 * 60 * 60, refreshToken);
        return { token, refreshToken, user: { id: userFound.id, email: userFound.email, name: userFound.name } };
    }

    async logout(req: Request, res: Response) {
        const token = req.cookies.refreshToken;
        if (!token) throw new LedgerFlowException(NO_SESSION_FOUND);
        let payload: any;
        try {
            payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!);
        } catch {
            throw new LedgerFlowException(NO_SESSION_FOUND);
        }
        await redisClient.del(`user:token:${payload.userId}`);
        await redisClient.del(`user:refresh:${payload.userId}`);
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        return true;
    }

    async refreshToken(incomingToken: string) {
        if (!incomingToken) throw new LedgerFlowException(NO_SESSION_FOUND);
        let payload: any;
        try {
            payload = jwt.verify(incomingToken, process.env.JWT_REFRESH_SECRET!);
        } catch (err) {
            throw new LedgerFlowException(NO_SESSION_FOUND);
        }
        const savedToken = await redisClient.get(`user:refresh:${payload.userId}`);
        if (!savedToken || savedToken !== incomingToken) throw new LedgerFlowException(NO_SESSION_FOUND);
        const user = await this.userRepository.findById(payload.userId);
        if (!user) throw new LedgerFlowException(NO_SESSION_FOUND);
        const newAccessToken = await this.signAndCacheLoginToken(user as User);
        return { accessToken: newAccessToken };
    }

    private async signAndCacheLoginToken(userFound: User) {
        const token = jwt.sign({ user: userFound.id, email: userFound.email }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        await redisClient.setEx(`user:token:${userFound.id}`, 24 * 60 * 60, token);
        return token;
    }

    private async cacheUserToRedis(response: { email: string, name: string, id: number, createdAt: Date }) {
        await redisClient.set(`user:email:${response.email}`, response.id.toString());
        await redisClient.setEx(`user:profile:${response.id}`, 86400, JSON.stringify(response));
    }

    private async validateEmailExistence(existingUser: string | null, dto: RegisterDTO) {
        if (existingUser) throw new LedgerFlowException(EMAIL_ALREADY_EXIST);
        const existingUserInDb = await this.userRepository.findOne({ where: { email: dto.email.toLowerCase() } });
        if (existingUserInDb) throw new LedgerFlowException(EMAIL_ALREADY_EXIST);
    }
}

export const userService = new UserService();