import { Types } from "mongoose";
import {
    Ctx,
    InjectBot,
    On,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobType, LeanJobType, UserType } from "src/db/db.types";
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

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const pmMsg = `Please enter a list of users who will be doing the job, iteratively taking the shifts. The list must contain only Telegram usernames (choose a chat member, starting to type @), devided by a whitespase.`
        await ctx.editMessageText(pmMsg);
        ctx.wizard.next();
    }
    
    @WizardStep(2)
    @On("text")
    async onNewUsers(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        const users = ctx.text;
        const invalidUsers = [];
        const names = users.split(" ");
        
        for (const name of names) {
            const user: UserType = await this.userService.findUserByName(name);
            if (!user) {
                invalidUsers.push(name);
            } else {
                const updatedJob = await this.jobService.addUserToJob(jobId, user)
                const pmMsg = `User ${name} added to ${updatedJob.name}.`;
                await ctx.reply(pmMsg);
            }
        }

        if (invalidUsers.length > 0) {
            const invalidUsersString = invalidUsers.join(", ");
            const pmMsg = `Users: ${invalidUsersString} not found. Please add the usernames to the list of chat users (user must use /start command).`;
            await ctx.reply(pmMsg);
            return ctx.scene.reenter();
        }
        await ctx.scene.leave();
    }
}
