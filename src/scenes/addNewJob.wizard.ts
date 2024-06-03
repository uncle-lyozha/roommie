import {
    Ctx,
    InjectBot,
    On,
    Sender,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobType, UserType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { UserService } from "src/db/user.service";
import { Telegraf } from "telegraf";
// import { SceneContext, WizardContext } from "telegraf/typings/scenes";
import { SceneContext, WizardContext } from "telegraf/scenes";

@Wizard("addnewjob")
export class addNewJob {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly userService: UserService,
        private readonly jobService: JobService,
    ) {}


    private job = {
        _id: "",
        name: "",
        chatId: 0,
        users: [],
        description: "",
        currUserIndex: 0,
    };

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        this.job.chatId = ctx.chat.id; // ERROR [ExceptionsHandler] Cannot set properties of null (setting 'chatId') - when trying to add second job right after the first was added
        const pmMsg =
            "Please enter a unique job name (Guidline: use a verb-noun construction, e.x. 'Clean the Kitchen', 'Pay the bills'). You can edit it later.";
        await ctx.editMessageText(pmMsg);
        ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onJobName(@Ctx() ctx: WizardContext) {
        const jobName = ctx.text;
        this.job.name = jobName;
        const pmMsg = `Please enter a list of users who will be doing the job, iteratively taking the shifts. The list must contain only Telegram usernames (choose a chat member, starting to type @), devided by a whitespase.`;
        await ctx.reply(pmMsg);
        ctx.wizard.next();
    }

    @WizardStep(3)
    @On("text")
    async onJobUsers(@Ctx() ctx: WizardContext) {
        const users = ctx.text;
        const invalidUsers = [];
        const names = users.split(" ");
        for (const name of names) {
            const user: UserType = await this.userService.findUserByName(name);
            if (!user) {
                invalidUsers.push(name);
            } else {
                this.job.users.push(user);
            }
        }
        if (invalidUsers.length > 0) {
            const invalidUsersString = invalidUsers.join(", ");
            const pmMsg = `Users: ${invalidUsersString} are not found. Please add the usernames to the list of chat users (user must use /start command) and try to create a job again.`;
            // this.job = this.ø
            this.job = {
                _id: "",
                name: "",
                chatId: 0,
                users: [],
                description: "",
                currUserIndex: 0,
            };
            await ctx.scene.leave();
            await ctx.reply(pmMsg);
        } else {
            const pmMsg = `Please enter a description for the new job (what a user on duty should do).`;
            await ctx.reply(pmMsg);
            ctx.wizard.next();
        }
    }

    @WizardStep(4)
    @On("text")
    async onJobDesc(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        this.job.description = ctx.text;
        await this.jobService.addNewJob(this.job);
        const pmMsg = `New Job "${this.job.name}" added.`;
        await ctx.reply(pmMsg);
        // this.job = this.ø
        this.job = {
            _id: "",
            name: "",
            chatId: 0,
            users: [],
            description: "",
            currUserIndex: 0,
        };
        await ctx.scene.leave();
    }
}
