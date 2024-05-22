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
import { JobType, MySessionType } from "src/db/db.types";
import { JobService } from "src/db/job.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { actionMenuOption, cbType } from "utils/const";

@Wizard("menu")
@Update()
export class MenuWizard {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
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
        ctx.scene.enter("addnewjob");
        await ctx.scene.leave();
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
    // @WizardStep(5)
    async onExit(@Ctx() ctx: SceneContext) {
        this.job = null;
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.moveUserFwd)
    // @WizardStep(6)
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
    // @WizardStep(7)
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
    // @WizardStep(8)
    async onAddUser(@Ctx() ctx: SceneContext) {
        const jobId = this.job._id;
        await ctx.scene.enter("addusertojob", { jobId });
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.delUser)
    // @WizardStep(9)
    async onDelUser(@Ctx() ctx: WizardContext) {
        const jobId = this.job._id;
        await ctx.scene.enter("deluser", { jobId });
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.renameJob)
    // @WizardStep(10)
    async onRename(@Ctx() ctx: WizardContext) {
        // await ctx.scene.enter("renameJob", { id: this.job._id });
        console.log("BYE12");
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.editDescr)
    // @WizardStep(11)
    async onEditDescription(@Ctx() ctx: WizardContext) {
        // await ctx.scene.enter("editDescription", { id: this.job._id });
        console.log("BYE11");
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.deleteJob)
    async onDelJob(@Ctx() ctx: WizardContext) {
        console.log("BYE12");
        // await ctx.scene.enter("delJob", { id: this.job._id });
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }
}
