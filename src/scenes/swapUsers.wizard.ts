import { Action, Ctx, Wizard, WizardStep } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { KeyboardService } from "src/services/keyboard.service";
import { WizardContext } from "telegraf/scenes";
import { customStateType } from "utils/utils.types";

@Wizard("swapusers")
export class SwapUsersWizard {
    constructor(
        private readonly keyboard: KeyboardService,
        private readonly jobService: JobService,
    ) {}

    private user1Id: string;
    private user2Id: string;
    private job;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const sceneState = ctx.wizard.state as customStateType;
        const jobId = sceneState.jobId;
        const msg =
            "You are about to change the line-up for this job. Choose the first user you want to swap shifts with.";
        await ctx.editMessageText(msg);
        this.job = await this.jobService.getJobById(jobId.toString());

        if (this.job.users.length < 2) {
            this.job = {
                _id: "",
                name: "",
                chatId: 0,
                users: [],
                description: "",
                currUserIndex: 0,
            };
            const msg = "There's only one user to this job, nothing to swap.";
            await ctx.editMessageText(msg);
            await ctx.scene.leave();
        }

        await this.keyboard.showUserList(ctx, this.job);
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
        await this.keyboard.showUserList(ctx, this.job);
        ctx.wizard.next();
    }

    @WizardStep(3)
    @Action(/user/)
    async onUser2(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        this.user2Id = data.split(":")[1];
        const updatedJob = await this.jobService.swapUsers(
            this.job._id,
            this.user1Id,
            this.user2Id,
        );
        if (updatedJob) {
            const msg = "Users has been swaped.";
            this.job.save();
            await ctx.editMessageText(msg);
        } else {
            const errMsgGeneral = "Error while processing. Try again later.";
            await ctx.editMessageText(errMsgGeneral);
        }
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
