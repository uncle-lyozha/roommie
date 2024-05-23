import { Injectable } from "@nestjs/common";
import { Ctx, InjectBot } from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { SessionService } from "src/db/session.service";
import { Context, Markup, Telegraf } from "telegraf";
import { actionMenuOption, cbType } from "utils/const";

@Injectable()
export class KeyboardService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly jobService: JobService,
        private readonly sessionService: SessionService,
    ) {}

    async showJobsKeyboard(@Ctx() ctx: Context): Promise<void> {
        const jobs: JobType[] = await this.jobService.getAllJobs(ctx.chat.id);
        if (!jobs) {
            await ctx.reply("No jobs found in DB.");
            return;
        }
        let buttons = [];
        const jobBtn = [
            Markup.button.callback("Add a Job", actionMenuOption.addJob),
        ];
        const exitBtn = [Markup.button.callback("Exit", actionMenuOption.exit)];

        for (const job of jobs) {
            const btn = [
                Markup.button.callback(
                    job.name,
                    "job:" + job._id,
                ),
            ];
            buttons.push(btn);
        }
        buttons.push(jobBtn, exitBtn);

        await ctx.reply(
            "Choose a job to see info or edit:",
            Markup.inlineKeyboard(buttons, { columns: 3 }),
        );
    }

    async showJobMenuKeyboard(@Ctx() ctx: Context, job: JobType, msg: string) {
        await ctx.editMessageText(msg, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Edit job",
                            callback_data: actionMenuOption.edit,
                        },
                    ],
                    [
                        {
                            text: "Exit",
                            callback_data: actionMenuOption.exit,
                        },
                    ],
                ],
            },
        });
    }
    
    async showConfirm(@Ctx() ctx: Context, msg: string) {
        await ctx.editMessageText(msg, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Confirm",
                            callback_data: actionMenuOption.confirm,
                        },
                    ],
                    [
                        {
                            text: "Exit",
                            callback_data: actionMenuOption.exit,
                        },
                    ],
                ],
            },
        });
    }

    async showEditMenuKeyboard(@Ctx() ctx: Context, jobId: string) {
        await ctx.editMessageText(
            "Edit options:",
            Markup.inlineKeyboard(
                [
                    Markup.button.callback(
                        "Move shift ➡️",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        //     actionMenuOption.moveUserFwd,
                        // ),
                        actionMenuOption.moveUserFwd,
                    ),
                    Markup.button.callback(
                        "Move shift ⬅️",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        //     actionMenuOption.moveUserBck,
                        // ),
                        actionMenuOption.moveUserBck,
                    ),
                    Markup.button.callback(
                        "Add user",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        //     actionMenuOption.addUser,
                        // ),
                        actionMenuOption.addUser,
                    ),
                    Markup.button.callback(
                        "Delete user",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        //     actionMenuOption.delUser,
                        // ),
                        actionMenuOption.delUser,
                    ),
                    Markup.button.callback(
                        "Rename job",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        //     actionMenuOption.renameJob,
                        // ),
                        actionMenuOption.renameJob,
                    ),
                    Markup.button.callback(
                        "Change description",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        //     actionMenuOption.editDescr,
                        // ),
                        actionMenuOption.editDescr,
                    ),
                    Markup.button.callback(
                        "Delete this job",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        //     actionMenuOption.deleteJob,
                        // ),
                        actionMenuOption.deleteJob,
                    ),
                    Markup.button.callback(
                        "Exit menu",
                        // await this.sessionService.createSession(
                        //     cbType.edit,
                        //     jobId,
                        // ),
                        actionMenuOption.exit,
                    ),
                ],
                {
                    columns: 1,
                },
            ),
        );
    }

    async showUserList(@Ctx() ctx: Context, job: JobType) {
        let buttons = [];
        for (const user of job.users) {
            const btn = [Markup.button.callback(user, "user:" + user)];
            buttons.push(btn);
        }
        await ctx.editMessageText(
            "Choose a user to delete from Job:",
            Markup.inlineKeyboard(buttons, { columns: 3 }),
        );
    }

    async hideKeyboard(@Ctx() context: Context) {
        await context.editMessageReplyMarkup({
            reply_markup: { remove_keyboard: true },
        } as any);
    }
}
