import { Ctx, InjectBot, On, Wizard, WizardStep } from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
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

    private job;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        this.job = (await this.jobService.getJobById(jobId)) as JobType;
        const pmMsg = `Please enter a new description for this Job.`;
        await ctx.editMessageText(pmMsg);
        ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onNewDecsription(@Ctx() ctx: WizardContext) {
        const newDescription = ctx.text;
        this.job.description = newDescription;
        await this.job.save();
        const msg = "Job's description updated.";
        await ctx.reply(msg);
        this.job = {};
        await ctx.scene.leave();
    }
}
