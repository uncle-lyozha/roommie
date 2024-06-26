import { UserType } from "src/db/schemas/user.schema";
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

// export type CbDataType = {
//     type: string;
//     jobId?: string;
//     taskId?: string;
//     option?: actionMenuOption;
// };

export type customStateType = {
    jobId: string;
};

export type newChatMemberType = {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    language_code: string;
};

export type TJobDto = {
    name: string;
    chatId: number;
    users: UserType[];
    description: string;
};
