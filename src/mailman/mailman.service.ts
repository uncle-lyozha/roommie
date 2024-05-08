import { Injectable } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { TaskType } from "src/db/db.types";
import { Markup, Telegraf } from "telegraf";
import { SceneContext } from "telegraf/scenes";
import { taskStatus } from "utils/const";
import * as notValidatedJson from "utils/script.json";
import { ScriptType } from "utils/utils.types";

@Injectable()
export class MailmanService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly db: DbService,
    ) {}

    private script: ScriptType = notValidatedJson;

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
        const taskId = task._id.toString();
        const currentStep = task.status;
        let room = "";
        if (task.status === taskStatus.new) {
            room = task.area;
        }
        const { buttons, message } = this.script[currentStep];
        for (let msg of message) {
            if (msg.type === "text") {
                const inlineKeyboard = buttons.map((button) => [
                    {
                        text: button.text,
                        callback_data: taskId + ":" + button.nextStep,
                    },
                ]);
                await this.bot.telegram.sendMessage(
                    task.TGId,
                    msg.text + room,
                    {
                        reply_markup: {
                            inline_keyboard: inlineKeyboard,
                        },
                    },
                );
            }
        }
    }
    
    async sendFinalPm (task: TaskType) {
        const taskId = task._id.toString();
        await this.bot.telegram.sendMessage(
            task.TGId,
            "No more snoozes. Please make the job done.",
            Markup.inlineKeyboard([
                Markup.button.callback(
                    "No more snoozes. Please make the job done.",
                    taskId + ":" + taskStatus.done
                ),
            ])
        );

    }
}