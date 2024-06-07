import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Session, TSession } from "./schemas/session.schema";
import { Model } from "mongoose";

@Injectable()
export class SessionService {
    constructor(
        @InjectModel("Session") private readonly sessionModel: Model<Session>,
    ) {}

    async createSession(
        type: string,
        id: string,
        option: string,
    ): Promise<string> {
        const newSession = new this.sessionModel({
            type,
            id,
            option,
        });
        const result = await newSession.save();
        return result._id.toString();
    }

    async findSessionById(id: string): Promise<TSession> {
        const session = await this.sessionModel.findById(id);
        return session;
    }

    async deleteSession(id: string): Promise<void> {
        await this.sessionModel.findByIdAndDelete(id);
    }
}
