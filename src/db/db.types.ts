import { ObjectId } from "mongoose";
import { taskStatus } from "utils/const";

export type TaskType = {
    _id: string;
    userName: string;
    TGId: number;
    area: string;
    description: string;
    status: taskStatus;
    date: Date;
    snoozedTimes: number;
    storyStep: string;
};

export type UserType = {
    _id: string;
    name: string;
    TG: {
        username: string;
        tgId: number;
    };
    rating: number;
};

export type RoomType = {
    name: string;
    users: string[];
    currUserIndex: number;
}
