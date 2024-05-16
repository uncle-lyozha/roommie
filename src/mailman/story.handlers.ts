import { Inject } from "@nestjs/common";
import { Ctx, InjectBot, On, Update } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Context, Telegraf } from "telegraf";
import { taskStatus } from "utils/const";

@Update()
export class StoryCbQueryHandler {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        @Inject(KeyboardService) private readonly keyboard: KeyboardService,
        private readonly jobService: JobService,
        private readonly taskService: TaskService,
        private readonly userService: UserService,
    ) {}

    @On("callback_query")
    async onStoryCbQuery(@Ctx() ctx: Context) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const cbType = data.split(":")[0];
        const taskId = data.split(":")[1];
        const nextStep = data.split(":")[2];

        if (cbType === "story") {
            await this.handleStorySteps(ctx, taskId, nextStep);
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
                "Awesome! You're the best.",
            );
            await ctx.telegram.sendPoll(
                process.env.CHAT_ID as string,
                `How do you assess ${task.userName}'s job: ${task.area}?`,
                ["🦍", "🍄", "💩"],
            );
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