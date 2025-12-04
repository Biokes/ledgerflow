import { Database } from "../../config";
import { User } from "../models";
import BaseRepository from "./base";

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(Database.getRepository(User));
    }
}

export const userRepository = new UserRepository();