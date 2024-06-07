import { Ctx, On, Wizard, WizardStep } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { WizardContext } from "telegraf/scenes";
import { customStateType } from "utils/utils.types";

@Wizard("editJobName")
export class EditJobName {
    constructor(private readonly jobService: JobService) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const pmMsg = `Please enter a new name for this Job.`;
        await ctx.editMessageText(pmMsg);
        ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onNewDecsription(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        const newName = ctx.text;
        const updatedJob = await this.jobService.editJobName(jobId, newName);
        const msg = `Job's name changed to ${updatedJob.name}.`;
        await ctx.reply(msg);
        await ctx.scene.leave();
    }
}
