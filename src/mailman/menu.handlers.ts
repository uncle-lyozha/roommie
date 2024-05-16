import { Inject } from "@nestjs/common";
import { Ctx, InjectBot, On, Update } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Context, Telegraf } from "telegraf";
import { SceneContext } from "telegraf/scenes";
import { editMenuOption, taskStatus } from "utils/const";

@Update()
export class MenuCbQueryHandler {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        @Inject(KeyboardService) private readonly keyboard: KeyboardService,
        private readonly jobService: JobService,
        private readonly taskService: TaskService,
        private readonly userService: UserService,
    ) {}

    @On("callback_query")
    async onCbQuery(@Ctx() ctx: SceneContext) {
        const chatId = ctx.chat.id;
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const cbType = data.split(":")[0];
        const jobName = data.split(":")[1];
        const option = data.split(":")[2];

        if (cbType === "jobs") {
            await this.handleJobMenu(ctx, chatId, jobName);
        }
        if (cbType === "editButton") {
            await this.keyboard.showEditKeyboard(ctx, jobName);
        }
        if (cbType === "edit") {
            const job = await this.jobService.getJobByName(chatId, jobName)
            await ctx.scene.enter("editjob", job);
        }
        if (cbType === "backtojoblist") {
        }
    }

    private async handleJobMenu(ctx: Context, chatId: number, jobName: string) {
        const job = await this.jobService.getJobByName(chatId, jobName);
        const msg = `
        ~~${job.name}:~~
        Users: ${job.users};
        On Duty: ${job.users[job.currUserIndex]};
        Descritption: ${job.description}
        `;
        await ctx.editMessageText(msg, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Edit job",
                            callback_data: "editButton:" + job.name,
                        },
                    ],
                ],
            },
        });
    }

    private async editHandler(
        ctx: Context,
        chatId: number,
        jobName: string,
        option: editMenuOption,
    ) {
        const job = await this.jobService.getJobByName(chatId, jobName);
        if (option === editMenuOption.moveUserFwd) {
            await this.jobService.setNextUserOnDuty(job.name, option);
        }
        if (option === editMenuOption.moveUserBck) {
            await this.jobService.setNextUserOnDuty(job.name, option);
        }
        if (option === editMenuOption.addUser) {
        }
        await this.keyboard.hideKeyboard(ctx);
    }
}
