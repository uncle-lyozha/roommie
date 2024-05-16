import {
    Ctx,
    InjectBot,
    On,
    Sender,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { UserService } from "src/db/user.service";
import { Context, Telegraf } from "telegraf";
// import { SceneContext, WizardContext } from "telegraf/typings/scenes";
import { SceneContext, WizardContext } from "telegraf/scenes";

@Wizard("addnewjob")
export class addNewJob {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly userService: UserService,
        private readonly jobService: JobService,
    ) {}

    private job: JobType = {
        name: "",
        chatId: 0,
        users: [],
        description: "",
        currUserIndex: 0,
    };

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        const msg =
            "Please enter a job name (Guidline: use a verb-noun construction, e.x. 'Clean the Kitchen', 'Pay the bills'). You can edit it later.";
        await ctx.sendMessage(msg);
        ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onJobName(@Ctx() ctx: WizardContext) {
        this.job.chatId = ctx.chat.id;
        const jobName = ctx.text;
        this.job.name = jobName;
        await ctx.reply(
            `Please enter a list of users who will be doing the job, iteratively taking the shifts. The list must contain only Telegram usernames (without @), devided by a whitespase.`,
        );
        ctx.wizard.next();
    }

    @WizardStep(3)
    @On("text")
    async onJobUsers(@Ctx() ctx: WizardContext) {
        const users = ctx.text;
        const invalidUsers = [];
        for (const name of users.split(" ")) {
            const user = await this.userService.findUserByName(name);
            if (!user) {
                invalidUsers.push(name);
            } else {
                this.job.users.push(user.userName);
            }
        }
        if (invalidUsers.length > 0) {
            const invalidUsersString = invalidUsers.join(", ");
            await ctx.reply(
                `Users: ${invalidUsersString} not found. Please add the usernames to the list of chat users (user must use /start command).`,
            );
            this.job.users = [];
            return ctx.scene.reenter();
        }

        await ctx.reply(
            `Please enter a description for the new job (what a user on duty should do).`,
        );
        ctx.wizard.next();
    }

    @WizardStep(4)
    @On("text")
    async onJobDesc(@Ctx() ctx: WizardContext) {
        this.job.description = ctx.text;
        await this.jobService.addNewJob(this.job);
        this.job = {
            name: "",
            chatId: 0,
            users: [],
            description: "",
            currUserIndex: 0,
        };
        await ctx.reply(`New Job ${this.job.name} added.`);
        await ctx.scene.leave();
    }
}
