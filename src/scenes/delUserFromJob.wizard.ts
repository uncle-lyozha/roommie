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
        this.job = await this.jobService.getJobById(jobId.toString());
        await this.keyboard.showUserList(ctx, this.job);
        ctx.wizard.next();
    }
    
    @Action(/user/)
    async onUserList(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const userName = data.split(":")[1];
        console.log(this.job._id.toString())
        await this.jobService.deleteUserFromJob(this.job._id.toString(), userName);
        const pmMsg = `User ${userName} deleted from job "${this.job.name}".`;
        await ctx.editMessageText(pmMsg);
        await this.job.save();
        this.job = null;
        await ctx.scene.leave();
    }
}
