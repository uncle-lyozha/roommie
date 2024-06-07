import { Types } from "mongoose";
import {
    Action,
    Ctx,
    InjectBot,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
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

    private jobId: string;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        this.jobId = sceneState.jobId;
        const msg = "Choose a user to delete from job";
        await ctx.editMessageText(msg);
        await this.keyboard.showUserList(ctx, this.jobId);
        ctx.wizard.next();
    }
    
    @Action(/user/)
    async onUserList(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const userIdString = data.split(":")[1];
        const userId = new Types.ObjectId(userIdString);
        const updatedJob = await this.jobService.deleteUserFromJob(
            this.jobId,
            userId,
        );
        const pmMsg = `User deleted from job "${updatedJob.name}".`;
        await ctx.editMessageText(pmMsg);
        await ctx.scene.leave();
    }
}
