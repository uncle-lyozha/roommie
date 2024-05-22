import { actionMenuOption } from "./const";

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
    type: string;
    jobId?: string;
    taskId?: string;
    option?: actionMenuOption;
};

export type customStateType = {
    jobId: string;
};
