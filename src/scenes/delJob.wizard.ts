import {
    Action,
    Ctx,
    InjectBot,
    On,
    Sender,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { actionMenuOption } from "utils/const";
import { customStateType } from "utils/utils.types";

@Wizard("delJob")
export class delJob {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly jobService: JobService,
        private readonly keyboard: KeyboardService,
        private readonly taskService: TaskService,
    ) {}

    private jobId: string;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        this.jobId = sceneState.jobId;
        const msg = `Are you sure you want to delete this Job?`;
        await this.keyboard.showConfirm(ctx, msg);
        ctx.wizard.next();
    }

    @Action(actionMenuOption.confirm)
    async onConfirm(@Ctx() ctx: WizardContext) {
        await this.jobService.deleteJob(this.jobId);
        await this.taskService.deleteAllTasksForJob(this.jobId);
        const msg = "Job and tasks assossiated with it has been deleted.";
        ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.exit)
    async onExit(@Ctx() ctx: SceneContext) {
        this.jobId = "";
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        await ctx.scene.leave();
    }
}
