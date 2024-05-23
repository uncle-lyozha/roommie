import {
    Action,
    Ctx,
    Sender,
    Update,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Context } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { actionMenuOption } from "utils/const";

@Wizard("menu")
@Update()
export class MenuWizard {
    constructor(
        private readonly keyboard: KeyboardService,
        private readonly jobService: JobService,
    ) {}

    private job: JobType = null;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        await this.keyboard.showJobsKeyboard(ctx);
        ctx.wizard.next();
    }

    @Action(actionMenuOption.addJob)
    async onAddJob(@Ctx() ctx: WizardContext) {
        this.job = null;
        await ctx.scene.leave();
        ctx.scene.enter("addnewjob");
    }

    @Action(/job/)
    async onSelectJob(@Ctx() ctx: WizardContext) {
        const cbQuery = ctx.callbackQuery;
        const data = "data" in cbQuery ? cbQuery.data : null;
        const jobId = data.split(":")[1];
        this.job = await this.jobService.getJobById(jobId);
        const msg = `
            **${this.job.name}:**
            Users: ${this.job.users};
            On Duty: ${this.job.users[this.job.currUserIndex]};
            Descritption: ${this.job.description}
            `;
        await this.keyboard.showJobMenuKeyboard(ctx, this.job, msg);
        ctx.wizard.next();
    }

    @Action(actionMenuOption.edit)
    async onEditJob(@Ctx() ctx: WizardContext) {
        await this.keyboard.showEditMenuKeyboard(ctx, this.job._id);
        ctx.wizard.next();
    }

    @Action(actionMenuOption.exit)
    async onExit(@Ctx() ctx: SceneContext) {
        this.job = null;
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.moveUserFwd)
    async onNextShift(@Ctx() ctx: WizardContext) {
        await this.jobService.setNextUserOnDuty(
            this.job._id,
            actionMenuOption.moveUserFwd,
        );
        this.job = null;
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.moveUserBck)
    async onPrevShift(@Ctx() ctx: WizardContext) {
        await this.jobService.setNextUserOnDuty(
            this.job._id,
            actionMenuOption.moveUserFwd,
        );
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.addUser)
    async onAddUser(@Ctx() ctx: SceneContext) {
        const jobId = this.job._id;
        await ctx.scene.leave();
        await ctx.scene.enter("addusertojob", { jobId });
    }

    @Action(actionMenuOption.delUser)
    async onDelUser(@Ctx() ctx: WizardContext) {
        const jobId = this.job._id;
        await ctx.scene.leave();
        await ctx.scene.enter("deluser", { jobId });
    }

    @Action(actionMenuOption.renameJob)
    async onRename(@Ctx() ctx: WizardContext) {
        const jobId = this.job._id;
        await ctx.scene.leave();
        await ctx.scene.enter("editJobName", { jobId });
    }

    @Action(actionMenuOption.editDescr)
    // @WizardStep(11)
    async onEditDescription(@Ctx() ctx: WizardContext) {
        const jobId = this.job._id;
        await ctx.scene.leave();
        await ctx.scene.enter("updateDescr", { jobId });
    }

    @Action(actionMenuOption.deleteJob)
    async onDelJob(
        @Ctx() ctx: WizardContext,
        @Sender("id") userId: number,
    ) {
        const jobId = this.job._id;
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            await ctx.scene.leave();
            await ctx.scene.enter("delJob", { jobId });    
        } else {
            const msg = "You are not authorised to do it."
            await ctx.editMessageText(msg);
            await ctx.scene.leave();
        }

    }

    private async isAdmin(
        chatId: number,
        userId: number,
        ctx: Context,
    ): Promise<boolean> {
        const chatMember = await ctx.telegram.getChatMember(chatId, userId);
        if (
            chatMember.status === "creator" ||
            chatMember.status === "administrator"
        ) {
            return true;
        } else {
            return false;
        }
    }
}
