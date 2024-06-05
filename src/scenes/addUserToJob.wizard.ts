import { Types } from "mongoose";
import {
    Ctx,
    InjectBot,
    On,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { UserService } from "src/db/user.service";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { customStateType } from "utils/utils.types";

@Wizard("addusertojob")
export class addUserToJob {
    constructor(
        private readonly jobService: JobService,
        private readonly userService: UserService,
    ) {}

    private job: JobType;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        this.job = await this.jobService.getJobById(jobId);
        const pmMsg = `Please enter a list of users who will be doing the job, iteratively taking the shifts. The list must contain only Telegram usernames (choose a chat member, starting to type @), devided by a whitespase.`
        await ctx.editMessageText(pmMsg);
        ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onNewUsers(@Ctx() ctx: WizardContext) {
        const users = ctx.text;
        const invalidUsers = [];
        const names = users.split(" ");
        const chatId = ctx.chat.id
        const jobId = new Types.ObjectId(this.job.id)
        
        for (const name of names) {
            const user = await this.userService.findUserByName(name);
            if (!user) {
                invalidUsers.push(name);
            } else {
                await this.jobService.addUserToJob(chatId, this.job.id, user._id)
                this.job.users.push(user.userName);
                const pmMsg = `User ${user.userName} added to ${this.job.name}.`;
                await ctx.reply(pmMsg);
            }
        }
        if (invalidUsers.length > 0) {
            const invalidUsersString = invalidUsers.join(", ");
            const pmMsg = `Users: ${invalidUsersString} not found. Please add the usernames to the list of chat users (user must use /start command).`;
            await ctx.reply(pmMsg);
            return ctx.scene.reenter();
        }
        await this.job.save();
        this.job = {};
        await ctx.scene.leave();
    }
}
