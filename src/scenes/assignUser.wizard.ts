import { Action, Ctx, InjectBot, Wizard, WizardStep } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
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

    private job;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        const msg =
            "Choose a user you want to assign to be on duty for the job this week.";
        await ctx.editMessageText(msg);
        this.job = await this.jobService.getJobById(jobId);
        await this.keyboard.showUserList(ctx, this.job);

        ctx.wizard.next();
    }

    @Action(/user/)
    async onUserList(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const userId: string = data.split(":")[1];
        const userIndex: number = this.job.users.findIndex(
            (user) => user._id.toString() === userId,
        );
        await this.jobService.setUserOnDuty(this.job._id, userIndex);
        // suggest list of tasks to delete
        await this.taskService.deleteAllTasksForJob(this.job.name);
        const newTask = await this.taskService.createTaskForJob(this.job);
        if (newTask) {
            await this.mailman.sendMonPM(newTask);
        } else {
            const errMsgGeneral = "Error while processing. Try again later.";
            await ctx.editMessageText(errMsgGeneral);
        }
        const pmMsg = `New task "${newTask.jobName}" created for ${newTask.userName}`;
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
