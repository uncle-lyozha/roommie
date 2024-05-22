import { Injectable } from "@nestjs/common";
import { InjectBot } from "nestjs-telegraf";
import { TaskType } from "src/db/db.types";
import { SessionService } from "src/db/session.service";
import { Markup, Telegraf } from "telegraf";
import { SceneContext } from "telegraf/scenes";
import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram";
import { cbType, taskStatus } from "utils/const";
import * as notValidatedJson from "utils/script.json";
import { ScriptType } from "utils/utils.types";

@Injectable()
export class MailmanService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly sessionService: SessionService,
    ) {}

    private script: ScriptType = notValidatedJson;

    async notifyAllChats(tasks: TaskType[]): Promise<void> {
        tasks.forEach(async (task) => {
            const message = `-= Attention! =-\n-= This week ${task.userName} takes turn to do the job: ${task.area} =-\n\nPlease recieve the assignment and guidelines in private messages.`;
            await this.bot.telegram.sendMessage(task.chatId, message);
        });
    }

    async sendChatDutyNotification(chatId: number, tasks: TaskType[]) {
        tasks.forEach(async (task) => {
            const message = `-= Attention! =-\n-= This week ${task.userName} takes turn to do the job: ${task.area} =-\n\nPlease recieve the assignment and guidelines in private messages.`;
            await this.bot.telegram.sendMessage(chatId, message);
        });
    }

    async sendMonPM(task: TaskType) {
        const taskId = task._id.toString();
        const currentStep = task.status;
        let job = "";
        if (task.status === taskStatus.new) {
            job = task.area;
        }
        const { buttons, message } = this.script[currentStep];
        for (let msg of message) {
            if (msg.type === "text") {
                let inlineKeyboard: InlineKeyboardButton[][] = [];
                for (const button of buttons) {
                    const payloadId = await this.sessionService.createSession(
                        cbType.story,
                        taskId,
                        button.nextStep,
                    );
                    const btn = [
                        {
                            text: button.text,
                            callback_data: payloadId,
                        },
                    ];
                    inlineKeyboard.push(btn);
                }

                await this.bot.telegram.sendMessage(task.TGId, msg.text + job, {
                    reply_markup: {
                        inline_keyboard: inlineKeyboard,
                    },
                });
            }
        }
    }

    async sendFinalPm(task: TaskType) {
        const taskId = task._id.toString();
        const payloadId = await this.sessionService.createSession(
            cbType.edit,
            taskId,
            taskStatus.done,
        );
        await this.bot.telegram.sendMessage(
            task.TGId,
            "No more snoozes. Please make the job done.",
            Markup.inlineKeyboard([
                Markup.button.callback("The job is done.", payloadId),
            ]),
        );
    }
}
