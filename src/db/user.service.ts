import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./schemas/user.schema";
import { UserType } from "./db.types";

@Injectable()
export class UserService {
    constructor(@InjectModel("User") private readonly userModel: Model<User>) {}

    async createUser(name: string, tgId: number) {
        const newUser = new this.userModel({
            userName: name,
            tgId: tgId,
        });
        const result = await newUser.save();
        console.log(`New user created:\n ` + result);
    }

    async findUserByName(name: string): Promise<UserType> {
        const user: UserType = await this.userModel.findOne({
            userName: name,
        });
        if (user) {
            return user;
        } else {
            console.error(`User ${name} not found in DB.`);
        }
    }
}