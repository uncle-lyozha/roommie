import { Injectable } from "@nestjs/common";
import {
    Action,
    Command,
    Ctx,
    Hears,
    InjectBot,
    Scene,
    SceneEnter,
    SceneLeave,
} from "nestjs-telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import { Update } from "telegraf/typings/core/types/typegram";
import { Context, Scenes, Telegraf } from "telegraf";
import * as scripJson from "../../utils/script.json";
import * as repliesJson from "../../utils/replies.json";
import { CbDataType, RepliesType, ScriptType } from "utils/utils.types";
import { TaskType } from "src/db/db.types";
import { DbService } from "src/db/db.service";

@Injectable()
@Scene("cleaningQuest")
export class CleaningQuest {
    private script: ScriptType = scripJson;
    private replies: RepliesType = repliesJson;

    constructor(
        @InjectBot() private readonly bot: Telegraf<Scenes.SceneContext>,
        private readonly db: DbService,
    ) {}

    @SceneEnter()
    async enter(task: TaskType) {
        const currentStep = task.storyStep;
        const { buttons, msg } = this.script[currentStep];
        for (let message of msg) {
            if (message.type === "image") {
                await this.bot.telegram.sendPhoto(268482275, message.src);
            }
            if (message.type === "text") {
                const inlineKeyboard = buttons.map((button) => {
                    const data: CbDataType = {
                        id: task._id,
                        reply: button.reply,
                        next: button.nextStep,
                    };
                    const cbData = JSON.stringify(data);
                    const kb = [
                        {
                            text: button.text,
                            callback_data: cbData,
                        },
                    ];
                    return kb;
                });
                await this.bot.telegram.sendMessage(
                    268482275,
                    message.message + task.area,
                    {
                        reply_markup: {
                            inline_keyboard: inlineKeyboard,
                        },
                    },
                );
            }
        }
    }

    @Action(/.* /)
    async onAnswer(
        @Ctx() context: SceneContext & { update: Update.CallbackQueryUpdate },
        // @Ctx() context: Scenes.SceneContext,
    ) {
        const cbQuery = context.update.callback_query;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const cbData: CbDataType = JSON.parse(data);
        console.log("RECEIVED DATA: " + cbData);
        const task = await this.db.getTaskById(cbData.id);
        const reply = this.replies[cbData.reply];
        // await this.bot.telegram.sendPhoto(268482275, reply.src, {
        //     caption: reply.caption,
        // });
        const msgId = context.callbackQuery.message?.message_id;
        await this.bot.telegram.editMessageText(
            268482275,
            msgId,
            "",
            reply.caption + task.description,
        );
        if (cbData.next === "fin") {
            await this.db.setDoneTaskStatus(cbData.id);
        }
        await this.db.setTaskStoryStep(cbData.id, cbData.next);
        await context.scene.leave();
    }
}
