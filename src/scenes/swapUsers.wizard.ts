import { Action, Ctx, Wizard, WizardStep } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { JobDocument } from "src/db/schemas/job.schema";
import { TaskService } from "src/db/task.service";
import { MailmanService } from "src/mailman/mailman.service";
import { KeyboardService } from "src/services/keyboard.service";
import { WizardContext } from "telegraf/scenes";
import { customStateType } from "utils/utils.types";

@Wizard("swapusers")
export class SwapUsersWizard {
    constructor(
        private readonly keyboard: KeyboardService,
        private readonly jobService: JobService,
        private readonly taskService: TaskService,
        private readonly mailman: MailmanService
    ) {}

    private user1Id: string;
    private user2Id: string;
    private jobId: string;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        this.jobId = sceneState.jobId;
        const msg =
            "You are about to change the line-up for this job. Choose the first user you want to swap shifts with.";
        await ctx.editMessageText(msg);
        const job = await this.jobService.getJobById(this.jobId);

        if (job.users.length < 2) {
            const msg = "There's only one user to this job, nothing to swap.";
            await ctx.editMessageText(msg);
            this.jobId = "";
            this.user1Id = "";
            this.user2Id = "";
            await ctx.scene.leave();
        }

        await this.keyboard.showUserList(ctx, this.jobId);
        ctx.wizard.next();
    }

    @WizardStep(2)
    @Action(/user/)
    async onUser1(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        this.user1Id = data.split(":")[1];
        const msg = "Choose the second user you want to swap.";
        await ctx.editMessageText(msg);
        await this.keyboard.showUserList(ctx, this.jobId);
        ctx.wizard.next();
    }

    @WizardStep(3)
    @Action(/user/)
    async onUser2(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        this.user2Id = data.split(":")[1];
        const updatedJob: JobDocument = await this.jobService.swapUsers(
            this.jobId,
            this.user1Id,
            this.user2Id,
        );
        await this.taskService.deleteAllTasksForJob(this.jobId);
        const newTask = await this.taskService.createTaskForJob(this.jobId);
        if (newTask) {
            await this.mailman.sendMonPM(newTask);
        } else {
            const errMsgGeneral = "Error while processing. Try again later.";
            await ctx.editMessageText(errMsgGeneral);
        }
        if (updatedJob) {
            const msg = "A new user on duty has been assigned for job: " + updatedJob.name;
            await ctx.editMessageText(msg);
        } else {
            const errMsgGeneral = "Error while processing. Try again later.";
            await ctx.editMessageText(errMsgGeneral);
        }
        this.jobId = "";
        this.user1Id = "";
        this.user2Id = "";
        await ctx.scene.leave();
    }
}
