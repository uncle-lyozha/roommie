import { ObjectId } from "mongoose";

export type ScriptType = {
    [key: string]: {
        message: {
            type: string;
            text?: string;
            src?: string;
        }[];
        buttons: {
            text: string;
            nextStep: string;
        }[];
    };
};

export type RepliesType = {
    [key: string]: {
        caption: string;
        src: string;
    };
};

export type CbDataType = {
    next: string;
    id: string;
    reply: string
};
