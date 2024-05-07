import { Injectable } from "@nestjs/common";
import { privateDecrypt } from "crypto";
import { InjectBot } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { TaskType } from "src/db/db.types";
import { Markup, Telegraf } from "telegraf";
import { SceneContext } from "telegraf/scenes";
import { taskStatus } from "utils/const";

@Injectable()
export class MailmanService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly db: DbService,
    ) {}

    async sendChatMsg(tasks: TaskType[]) {
        //add check type of arg to know how to send it
        let message = "May I Have Your Attention, please! \nThis week on duty:";
        tasks.forEach(async (task) => {
            message += `\n-= ${task.userName} is assigned to ${task.area} =-`;
        });
        message +=
            "\n\nPlease recieve the assignment and guidelines in private messages.";
        await this.bot.telegram.sendMessage(process.env.CHAT, message);
    }

    async sendMonPM(task: TaskType) {
        let msg = `PLEASE READ CAREFULY YOUR ASSIGNMENT!\n This week you are on duty in ${task.area}, your objectives are:\n${task.description}`;
        // let loadId = await this.db.createCbLoad(task);
        await this.bot.telegram.sendMessage(task.TGId, msg);
        const taskIdString = task._id.toString();
        const markup = Markup.inlineKeyboard([
            Markup.button.callback("Confirm", taskStatus.pending + ":" + taskIdString),
        ]);
        await this.bot.telegram.sendMessage(
            task.TGId,
            "Receive the assignment:",
            markup,
        );
    }


}
