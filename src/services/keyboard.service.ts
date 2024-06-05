import { Injectable } from "@nestjs/common";
import { Ctx, InjectBot } from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { SessionService } from "src/db/session.service";
import { UserService } from "src/db/user.service";
import { Context, Markup, Telegraf } from "telegraf";
import { actionMenuOption, adminMenuOption } from "utils/const";

@Injectable()
export class KeyboardService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly jobService: JobService,
        private readonly userService: UserService,
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
        const adminBtn = [
            Markup.button.callback("Personel only", actionMenuOption.adminMenu),
        ];

        for (const job of jobs) {
            const btn = [Markup.button.callback(job.name, "job:" + job._id)];
            buttons.push(btn);
        }
        buttons.push(jobBtn, adminBtn, exitBtn);

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
                        "Change the shift",
                        actionMenuOption.alterShift,
                    ),
                    Markup.button.callback(
                        "Add user",
                        actionMenuOption.addUser,
                    ),
                    Markup.button.callback(
                        "Delete user",
                        actionMenuOption.delUser,
                    ),
                    Markup.button.callback(
                        "Rename job",
                        actionMenuOption.renameJob,
                    ),
                    Markup.button.callback(
                        "Change description",
                        actionMenuOption.editDescr,
                    ),
                    Markup.button.callback(
                        "Delete this job ❌",
                        actionMenuOption.deleteJob,
                    ),
                    Markup.button.callback("Exit menu", actionMenuOption.exit),
                ],
                {
                    columns: 2,
                },
            ),
        );
    }

    async showAlterShiftMenu(@Ctx() ctx: Context) {
        const msg =
            "Here you can assign a user for a duty or swap two users in their line of shifts:";
        await ctx.editMessageText(
            msg,
            Markup.inlineKeyboard(
                [
                    Markup.button.callback(
                        "Assign a user",
                        actionMenuOption.assignUser,
                    ),
                    Markup.button.callback(
                        "Swap users 🔄",
                        actionMenuOption.swap,
                    ),
                    Markup.button.callback(
                        "Move shift ➡️",
                        actionMenuOption.moveUserFwd,
                    ),
                    Markup.button.callback(
                        "Move shift ⬅️",
                        actionMenuOption.moveUserBck,
                    ),
                    Markup.button.callback("Exit menu", actionMenuOption.exit),
                ],
                {
                    columns: 2,
                },
            ),
        );
    }

    async showAdminMenu(@Ctx() ctx: Context) {
        await ctx.editMessageText(
            "Choose your action",
            Markup.inlineKeyboard(
                [
                    Markup.button.callback(
                        "Create tasks for this group chat",
                        adminMenuOption.createTasks,
                    ),
                    Markup.button.callback(
                        "Notify users on duty in PM",
                        adminMenuOption.sendNotifications,
                    ),
                    // Markup.button.callback(
                    //     "Send a custom msg to this group chat",
                    //     adminMenuOption.sendChatMessage
                    // ),
                ],
                { columns: 3 },
            ),
        );
    }

    async showUserList(@Ctx() ctx: Context, job: JobType) {
        let buttons = [];
        for (const userName of job.users) {
            const user = await this.userService.findUserByName(
                userName.userName,
            );
            const btn = [
                Markup.button.callback(user.userName, "user:" + user._id),
            ];
            buttons.push(btn);
        }
        await ctx.reply(
            "This job's users:",
            Markup.inlineKeyboard(buttons, { columns: 3 }),
        );
    }

    async showAssessUserPoll(
        @Ctx() ctx: Context,
        chatId: number,
        userName: string,
        taskName: string,
    ) {
        await ctx.telegram.sendPoll(
            chatId,
            `How do you assess ${userName}'s job: ${taskName}?`,
            ["🦍", "🍄", "💩", "👾", "🍆"],
        );
    }

    async hideKeyboard(@Ctx() context: Context) {
        await context.editMessageReplyMarkup({
            reply_markup: { remove_keyboard: true },
        } as any);
    }
}
