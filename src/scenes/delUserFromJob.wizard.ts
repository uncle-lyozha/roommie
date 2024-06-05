import { Types } from "mongoose";
import {
    Action,
    Ctx,
    InjectBot,
    On,
    Sender,
    Update,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { UserService } from "src/db/user.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { customStateType } from "utils/utils.types";

@Wizard("deluser")
export class delUserFromJob {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly jobService: JobService,
        private readonly keyboard: KeyboardService,
    ) {}

    // private job: JobType; // fix types
    private job;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        const msg = "Choose a user to delete from job";
        await ctx.editMessageText(msg);
        this.job = await this.jobService.getJobById(jobId);
        await this.keyboard.showUserList(ctx, this.job);
        ctx.wizard.next();
    }

    @Action(/user/)
    async onUserList(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const userIdString = data.split(":")[1];
        const userId = new Types.ObjectId(userIdString);
        console.log(userId);
        const updatedJob = await this.jobService.deleteUserFromJob(
            this.job._id,
            userId,
        );
        console.log(updatedJob);
        const pmMsg = `User ${userId} deleted from job "${this.job.name}".`;
        await ctx.editMessageText(pmMsg);
        await this.job.save();
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
