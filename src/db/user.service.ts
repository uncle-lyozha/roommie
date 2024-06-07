import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument, UserType } from "./schemas/user.schema";
import { IUser } from "./user.interface";

@Injectable()
export class UserService implements IUser {
    constructor(@InjectModel("User") private readonly userModel: Model<User>) {}

    async createUser(name: string, tgId: number): Promise<UserDocument> {
        const newUser = new this.userModel({
            userName: name,
            tgId: tgId,
        });
        const result = await newUser.save();
        console.log(`New user created:\n ` + result);
        return result;
    }

    async findUserByName(name: string): Promise<UserType> | null {
        const user: UserType = await this.userModel.findOne({
            userName: name,
        });
        if (user) {
            return user;
        } else {
            console.error(`User ${name} not found in DB.`);
            return null;
        }
    }

    async findUserById(id: string): Promise<UserType> | null {
        const user: UserType = await this.userModel.findById(id);
        if (user) {
            return user;
        } else {
            console.error(`User ${id} not found in DB.`);
            return null;
        }
    }

    async findUserByTgId(tgId: number): Promise<UserType> | null {
        const user: UserType = await this.userModel.findOne({ tgId: tgId });
        if (user) {
            return user;
        } else {
            console.error(`User with ${tgId} not found in DB.`);
            return null;
        }
    }
}
