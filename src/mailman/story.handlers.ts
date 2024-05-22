import { Ctx, InjectBot, On, Update } from "nestjs-telegraf";
import { MySessionType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { SessionService } from "src/db/session.service";
import { TaskService } from "src/db/task.service";
import { Context, Telegraf } from "telegraf";
import { taskStatus } from "utils/const";

@Update()
export class StoryCbQueryHandler {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly jobService: JobService,
        private readonly taskService: TaskService,
        private readonly sessionService: SessionService,
    ) {}

    @On("callback_query")
    async onStoryCbQuery(@Ctx() ctx: Context) {
        const cbQuery = ctx.callbackQuery;
        const payloadId = "data" in cbQuery ? cbQuery.data : null;
        const payload: MySessionType =
            await this.sessionService.findSessionById(payloadId);
        if (payload.type === "story") {
            await this.handleStorySteps(ctx, payload.id, payload.option);
        } else {
            return null;
        }
    }

    private async handleStorySteps(
        ctx: Context,
        taskId: string,
        nextStep: string,
    ) {
        if (nextStep === taskStatus.pending) {
            await this.taskService.setTaskStatus(taskId, taskStatus.pending);
            const task = await this.taskService.getTaskById(taskId);
            console.log(`${task.userName} accepted his task: ${task.area}.`);
            await this.bot.telegram.deleteMessage(task.TGId, ctx.msgId);
            await this.bot.telegram.sendMessage(
                task.TGId,
                `Great! Here's what you should do (please read carefuly the instructions):\n${task.area}\n${task.description}`,
            );
        }

        if (nextStep === taskStatus.done) {
            await this.taskService.setTaskStatus(taskId, taskStatus.done);
            const task = await this.taskService.getTaskById(taskId);
            console.log(`${task.userName} has done his job: ${task.area}.`);
            await this.bot.telegram.deleteMessage(task.TGId, ctx.msgId);
            await this.bot.telegram.sendMessage(
                task.TGId,
                "Awesome! You're the best. Around!",
            );
            // await ctx.telegram.sendPoll(
            //     ctx.chat.id,
            //     `How do you assess ${task.userName}'s job: ${task.area}?`,
            //     ["🦍", "🍄", "💩"],
            // ); // send to general chat
        }

        if (nextStep === taskStatus.snoozed) {
            await this.taskService.setTaskStatus(taskId, taskStatus.snoozed);
            const task = await this.taskService.getTaskById(taskId);
            console.log(`${task.userName} snoozed his task: ${task.area}.`);
            await this.bot.telegram.deleteMessage(task.TGId, ctx.msgId);
            await this.bot.telegram.sendMessage(
                task.TGId,
                "No problem, I'll remind you later.",
            );
        }
    }
}