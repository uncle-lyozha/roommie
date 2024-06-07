import { Action, Ctx, InjectBot, Wizard, WizardStep } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { JobType } from "src/db/schemas/job.schema";
import { TaskService } from "src/db/task.service";
import { MailmanService } from "src/mailman/mailman.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { customStateType } from "utils/utils.types";

@Wizard("assignuser")
export class AssignUserWizard {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly jobService: JobService,
        private readonly taskService: TaskService,
        private readonly keyboard: KeyboardService,
        private readonly mailman: MailmanService,
    ) {}

    private jobId: string;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        this.jobId = sceneState.jobId;
        const msg =
            "Choose a user you want to assign to be on duty for the job this week.";
        await ctx.editMessageText(msg);
        await this.keyboard.showUserList(ctx, this.jobId);
        ctx.wizard.next();
    }

    @Action(/user/)
    async onUserList(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const userId: string = data.split(":")[1];
        const job = await this.jobService.getJobById(this.jobId);
        const userIndex: number = job.users.findIndex(
            (user) => user._id.toString() === userId,
        );
        await this.jobService.setUserOnDuty(this.jobId, userIndex);
        // suggest list of tasks to delete
        await this.taskService.deleteAllTasksForJob(this.jobId);
        const newTask = await this.taskService.createTaskForJob(this.jobId);
        if (newTask) {
            await this.mailman.sendMonPM(newTask);
        } else {
            const errMsgGeneral = "Error while processing. Try again later.";
            await ctx.editMessageText(errMsgGeneral);
        }
        const pmMsg =
            "New task created: \n" + newTask.jobName + " = " + newTask.userName;
        await ctx.editMessageText(pmMsg);
        await ctx.scene.leave();
    }
}
