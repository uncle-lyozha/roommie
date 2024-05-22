import {  taskStatus } from "utils/const";

export type TaskType = {
    _id: string;
    userName: string;
    chatId: number;
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
    userName: string;
    tgId: number;
    rating?: number;
};

export type JobType = {
    _id: string;
    name: string;
    chatId: number;
    users: string[];
    description: string;
    currUserIndex: number;
};

export type MySessionType = {
    type: string;
    id: string;
    option: string;
}
