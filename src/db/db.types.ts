import { ObjectId, Schema } from "mongoose";
import { taskStatus } from "utils/const";

export type TaskType = {
    _id: string;
    userName: string;
    chatId: number;
    TGId: number;
    jobName: string;
    description: string;
    status: taskStatus;
    date: Date;
    snoozedTimes: number;
    storyStep: string;
};

export type UserType = {
    _id: ObjectId;
    userName: string;
    tgId: number;
    rating?: number;
};

export type JobType = {
    _id: string;
    name: string;
    chatId: number;
    users: UserType[];
    description: string;
    currUserIndex: number;
    // save(): Promise<void>;
};

export type MySessionType = {
    type: string;
    id: string;
    option: string;
};
