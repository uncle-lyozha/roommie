import { Injectable } from "@nestjs/common";
import { Ctx, InjectBot } from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { Context, Markup, Telegraf } from "telegraf";
import { editMenuOption } from "utils/const";

@Injectable()
export class KeyboardService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly jobService: JobService,
    ) {}

    async showJobKeyboard(@Ctx() ctx: Context, chatId: number): Promise<void> {
        const jobs: JobType[] = await this.jobService.getAllJobs(chatId);
        console.log(jobs)
        if (!jobs) {
            await ctx.reply("No jobs found to DB.");
            return;
        }
        let buttons = jobs.map((job) =>
            Markup.button.callback(job.name, `jobs:${job.name}`),
        );
        await ctx.reply(
            "Choose a job to see info or edit:",
            Markup.inlineKeyboard(buttons, { columns: 3 }),
        );
    }

    async showEditKeyboard(@Ctx() ctx: Context, jobName: string) {
        await ctx.editMessageText(
            "Edit options:",
            Markup.inlineKeyboard(
                [
                    Markup.button.callback(
                        "Move shift ➡️",
                        "edit:" + jobName + editMenuOption.moveUserFwd,
                    ),
                    Markup.button.callback(
                        "Move shift ⬅️",
                        "edit:" + jobName + editMenuOption.moveUserBck,
                    ),
                    Markup.button.callback(
                        "Add user",
                        "edit:" + jobName + editMenuOption.addUser,
                    ),
                    Markup.button.callback(
                        "Delete user",
                        "edit:" + jobName + editMenuOption.delUser,
                    ),
                    Markup.button.callback(
                        "Rename job",
                        "edit:" + jobName + editMenuOption.renameJob,
                    ),
                    Markup.button.callback(
                        "Change description",
                        "edit:" + jobName + editMenuOption.editDescr,
                    ),
                    // Markup.button.callback(
                    //     "Go back to jobs list",
                    //     "backtoroomlist",
                    // ),
                ],
                {
                    columns: 1,
                },
            ),
        );
    }

    async hideKeyboard(@Ctx() context: Context) {
        await context.editMessageReplyMarkup({
            reply_markup: { remove_keyboard: true },
        } as any);
        await context.editMessageText("Done.");
    }
}
