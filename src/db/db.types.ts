import { ObjectId } from "mongoose";
import { taskStatus } from "src/utils/const";

export type TaskType = {
    _id: ObjectId;
    userName: string;
    TGId: number;
    area: string;
    description: string;
    status: taskStatus;
    date: Date;
    snoozedTimes: number;
};

export type UserType = {
    _id: ObjectId;
    name: string;
    TG: {
        username: string;
        tgId: number;
    };
    rating: number;
};