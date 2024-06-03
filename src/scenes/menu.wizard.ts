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
import { UserService } from "src/db/user.service";
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
        private readonly userService: UserService,
    ) {}

    private job: JobType = {
        _id: "",
        name: "",
        chatId: 0,
        users: [],
        description: "",
        currUserIndex: 0,
    };

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
        const currUserName = this.job.users[this.job.currUserIndex].userName;
        const userNameArray = this.job.users.map((user) => user.userName);
        const msg = `
            **${this.job.name}**
            Line up: ${userNameArray};
            This week on duty: ${currUserName};
            Job's description: \n${this.job.description}
            `;
        await this.keyboard.showJobMenuKeyboard(ctx, this.job, msg);
        ctx.wizard.next();
    }

    @Action(actionMenuOption.edit)
    async onEditJob(@Ctx() ctx: WizardContext, @Sender("id") userId: number) {
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            await this.keyboard.showEditMenuKeyboard(ctx, this.job._id);
            ctx.wizard.next();
        } else {
            const msg = "You are not authorised to do it.";
            await ctx.editMessageText(msg);
            await ctx.scene.leave();
        }
    }

    @Action(actionMenuOption.exit)
    async onExit(@Ctx() ctx: SceneContext) {
        this.job = {
            _id: "",
            name: "",
            chatId: 0,
            users: [],
            description: "",
            currUserIndex: 0,
        };
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.moveUserFwd)
    async onNextShift(@Ctx() ctx: WizardContext) {
        await this.jobService.setNextUserOnDuty(
            this.job._id,
            actionMenuOption.moveUserFwd,
        );
        this.job = {
            _id: "",
            name: "",
            chatId: 0,
            users: [],
            description: "",
            currUserIndex: 0,
        };
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

    @Action(actionMenuOption.swap)
    async onSwap(@Ctx() ctx: SceneContext) {
        const jobId = this.job._id;
        await ctx.scene.leave();
        await ctx.scene.enter("swapusers", { jobId });
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
    async onEditDescription(@Ctx() ctx: WizardContext) {
        const jobId = this.job._id;
        await ctx.scene.leave();
        await ctx.scene.enter("updateDescr", { jobId });
    }

    @Action(actionMenuOption.adminMenu)
    async onAdminMenu(@Ctx() ctx: WizardContext) {
        const jobId = this.job._id;
        await ctx.scene.leave();
        await ctx.scene.enter("adminMenu", { jobId });
    }

    @Action(actionMenuOption.deleteJob)
    async onDelJob(@Ctx() ctx: WizardContext, @Sender("id") userId: number) {
        const jobId = this.job._id;
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            await ctx.scene.leave();
            await ctx.scene.enter("delJob", { jobId });
        } else {
            const msg = "You are not authorised to do it.";
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
