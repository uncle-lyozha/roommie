import { Ctx, InjectBot, On, Wizard, WizardStep } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { customStateType } from "utils/utils.types";

@Wizard("updateDescr")
export class UpdateDescr {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly jobService: JobService,
    ) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const pmMsg = `Please enter a new description for this Job`;
        await ctx.editMessageText(pmMsg);
        ctx.wizard.next();
    }
    
    @WizardStep(2)
    @On("text")
    async onNewDecsription(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        const newDescription = ctx.text;
        const updatedJob = await this.jobService.editJobDescription(jobId, newDescription)
        const msg = `Description for "${updatedJob.name}" updated.`;
        await ctx.reply(msg);
        await ctx.scene.leave();
    }
}
