import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, ObjectId } from "mongoose";
import { User, UserType } from "./schemas/user.schema";

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
    
    async findUserById(id: string): Promise<UserType> {
        const user: UserType = await this.userModel.findById(id)
        if (user) {
            return user;
        } else {
            console.error(`User ${id} not found in DB.`);
        }
    }

    async findUserByTgId(id: number): Promise<UserType> {
        const user: UserType = await this.userModel.findOne({tgId: id})
        if (user) {
            return user;
        } else {
            console.error(`User ${id} not found in DB.`);
        }
    }
}
