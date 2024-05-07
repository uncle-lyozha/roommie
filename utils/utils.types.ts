import { ObjectId } from "mongoose";

export type ScriptType = {
    [key: string]: {
        msg: {
            type: string;
            message?: string;
            src?: string;
        }[];
        buttons: {
            reply: string;
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
