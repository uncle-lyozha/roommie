import {
    Action,
    Ctx,
    Sender,
    Update,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { UserService } from "src/db/user.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Context } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";
import { CallbackQuery } from "telegraf/typings/core/types/typegram";
import { actionMenuOption } from "utils/const";

@Wizard("menu")
@Update()
export class MenuWizard {
    constructor(
        private readonly keyboard: KeyboardService,
        private readonly jobService: JobService,
        private readonly userService: UserService,
    ) {}

    private jobId: string;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        await this.keyboard.showJobsKeyboard(ctx);
        ctx.wizard.next();
    }

    @Action(actionMenuOption.addJob)
    async onAddJob(@Ctx() ctx: WizardContext) {
        await ctx.scene.leave();
        ctx.scene.enter("addnewjob");
    }

    @Action(/job/)
    async onSelectJob(@Ctx() ctx: WizardContext) {
        const cbQuery: CallbackQuery = ctx.callbackQuery;
        const data: string = "data" in cbQuery ? cbQuery.data : null;
        this.jobId = data.split(":")[1];
        const job = await this.jobService.getJobById(this.jobId);
        let currUserName: string = "";
        let userNameArray: string[] | string;
        if (job.users.length === 0) {
            currUserName = "Nobody";
            userNameArray = "No users in the list.";
        } else {
            currUserName = job.users[job.currUserIndex].userName;
            userNameArray = job.users.map((user) => user.userName);
        }
        const msg = `
            **${job.name}**
            Line up: ${userNameArray};
            This week on duty: ${currUserName};
            Job's description: \n${job.description}
            `;
        await this.keyboard.showJobMenuKeyboard(ctx, msg);
        ctx.wizard.next();
    }

    @Action(actionMenuOption.edit)
    async onEditJob(@Ctx() ctx: WizardContext, @Sender("id") userId: number) {
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            await this.keyboard.showEditMenuKeyboard(ctx);
            ctx.wizard.next();
        } else {
            const msg = "You are not authorised to do it.";
            await ctx.editMessageText(msg);
            await ctx.scene.leave();
        }
    }

    @Action(actionMenuOption.alterShift)
    async onAlterShift(
        @Ctx() ctx: WizardContext,
        @Sender("id") userId: number,
    ) {
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            await this.keyboard.showAlterShiftMenu(ctx);
            ctx.wizard.next();
        } else {
            const msg = "You are not authorised to do it.";
            await ctx.editMessageText(msg);
            await ctx.scene.leave();
        }
    }

    @Action(actionMenuOption.exit)
    async onExit(@Ctx() ctx: SceneContext) {
        await ctx.deleteMessage(ctx.callbackQuery.message.message_id);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.moveUserFwd)
    async onNextShift(@Ctx() ctx: WizardContext) {
        await this.jobService.setNextUserOnDuty(
            this.jobId,
            actionMenuOption.moveUserFwd,
        );
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.moveUserBck)
    async onPrevShift(@Ctx() ctx: WizardContext) {
        await this.jobService.setNextUserOnDuty(
            this.jobId,
            actionMenuOption.moveUserFwd,
        );
        const msg = "Done.";
        await this.keyboard.hideKeyboard(ctx);
        await ctx.editMessageText(msg);
        await ctx.scene.leave();
    }

    @Action(actionMenuOption.assignUser)
    async onAssignUser(@Ctx() ctx: SceneContext) {
        const jobId = this.jobId;
        await ctx.scene.leave();
        await ctx.scene.enter("assignuser", { jobId });
    }

    @Action(actionMenuOption.swap)
    async onSwap(@Ctx() ctx: SceneContext) {
        const jobId = this.jobId;
        await ctx.scene.leave();
        await ctx.scene.enter("swapusers", { jobId });
    }

    @Action(actionMenuOption.addUser)
    async onAddUser(@Ctx() ctx: SceneContext) {
        const jobId = this.jobId;
        await ctx.scene.leave();
        await ctx.scene.enter("addusertojob", { jobId });
    }

    @Action(actionMenuOption.delUser)
    async onDelUser(@Ctx() ctx: WizardContext) {
        const jobId = this.jobId;
        await ctx.scene.leave();
        await ctx.scene.enter("deluser", { jobId });
    }

    @Action(actionMenuOption.renameJob)
    async onRename(@Ctx() ctx: WizardContext) {
        const jobId = this.jobId;
        await ctx.scene.leave();
        await ctx.scene.enter("editJobName", { jobId });
    }

    @Action(actionMenuOption.editDescr)
    async onEditDescription(@Ctx() ctx: WizardContext) {
        const jobId = this.jobId;
        await ctx.scene.leave();
        await ctx.scene.enter("updateDescr", { jobId });
    }

    @Action(actionMenuOption.adminMenu)
    async onAdminMenu(@Ctx() ctx: WizardContext) {
        const jobId = this.jobId;
        await ctx.scene.leave();
        await ctx.scene.enter("adminMenu", { jobId });
    }

    @Action(actionMenuOption.deleteJob)
    async onDelJob(@Ctx() ctx: WizardContext, @Sender("id") userId: number) {
        const jobId = this.jobId;
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
