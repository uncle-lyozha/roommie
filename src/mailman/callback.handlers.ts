import { Inject } from "@nestjs/common";
import { Ctx, InjectBot, On, Update } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Context, Telegraf } from "telegraf";
import { taskStatus } from "utils/const";

@Update()
export class CallbackHandlers {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        @Inject(KeyboardService) private readonly keyboard: KeyboardService,
        private readonly db: DbService,
    ) {}

    @On("callback_query")
    async onStoryQuery(@Ctx() ctx: Context) {
        const cbQuery = ctx.callbackQuery;
        const msgId = ctx.msgId;
        const chatId = ctx.chat.id;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const cbType = data.split(":")[0];
        const id = data.split(":")[1];
        const nextStep = data.split(":")[2];

        if (cbType === "rooms") {
            await this.handleRoomMenu(ctx, id);
        }
        if (cbType === "story") {
            await this.handleStorySteps(ctx, id, nextStep, msgId);
        }
    }

    private async handleRoomMenu(ctx: Context, id: string) {
        const room = await this.db.getRoomByName(ctx.chat.id, id);
        await this.keyboard.hideKeyboard(ctx);
        const msg = `
        Room Name: ${room.name};
        Users: ${room.users};
        On Duty: ${room.users[room.currUserIndex]};
        Descritption: ${room.description}
        `;
        await ctx.reply(msg);
    }

    private async handleStorySteps(
        ctx: Context,
        taskId: string,
        nextStep: string,
        msgId: number,
    ) {
        if (nextStep === taskStatus.pending) {
            await this.db.setTaskStatus(null, taskId);
            const task = await this.db.getTaskById(taskId);
            console.log(
                `${task.userName} accepted his task in the ${task.area}.`,
            );
            await this.bot.telegram.deleteMessage(task.TGId, msgId);
            await this.bot.telegram.sendMessage(
                task.TGId,
                `Great! Here's what you should do (please read carefuly the instructions):\n${task.area}\n${task.description}`,
            );
        }

        if (nextStep === taskStatus.done) {
            await this.db.setTaskStatus(null, taskId);
            const task = await this.db.getTaskById(taskId);
            console.log(`${task.userName} has done his job in ${task.area}.`);
            await this.bot.telegram.deleteMessage(task.TGId, msgId);
            await this.bot.telegram.sendMessage(
                task.TGId,
                "Awesome! You're the best.",
            );
            await ctx.telegram.sendPoll(
                process.env.CHAT_ID as string,
                `How do you assess ${task.userName}'s watch duty in the ${task.area}`,
                ["🦍", "🍄", "💩"],
            );
        }

        if (nextStep === taskStatus.snoozed) {
            await this.db.setTaskStatus(null, taskId);
            const task = await this.db.getTaskById(taskId);
            console.log(`${task.userName} snoozed his duty in ${task.area}.`);
            await this.bot.telegram.deleteMessage(task.TGId, msgId);
            await this.bot.telegram.sendMessage(
                task.TGId,
                "No problem, I'll remind you later.",
            );
        }
    }
}
