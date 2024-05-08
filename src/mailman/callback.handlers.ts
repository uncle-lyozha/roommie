import { Ctx, InjectBot, On, Update } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { Context, Telegraf } from "telegraf";
import { taskStatus } from "utils/const";

@Update()
export class CallbackHandlers {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly db: DbService,
    ) {}

    @On("callback_query")
    async onCallbackQuery(@Ctx() ctx: Context) {
        const cbQuery = ctx.callbackQuery;
        const msgId = ctx.msgId;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const taskId = data.split(":")[0];
        const nextStep = data.split(":")[1];
        
        if (nextStep === taskStatus.pending) {
            await this.db.setPendingTaskStatus(taskId);
            const task = await this.db.getTaskById(taskId);
            console.log(`${task.userName} accepted his task in the ${task.area}.`);
            await this.bot.telegram.deleteMessage(task.TGId, msgId);
            await this.bot.telegram.sendMessage(
                task.TGId,
                `Great! Here's what you should do (please read carefuly the instructions):\n${task.area}\n${task.description}`,
            );
        }

        if (nextStep === taskStatus.done) {
            await this.db.setDoneTaskStatus(taskId);
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
            await this.db.setSnoozedTaskStatus(taskId);
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
