import { Action, Ctx, Wizard, WizardStep } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { MailmanService } from "src/mailman/mailman.service";
import { KeyboardService } from "src/services/keyboard.service";
import { WizardContext } from "telegraf/scenes";
import { adminMenuOption, taskStatus } from "utils/const";

@Wizard("adminMenu")
export class AdminMenuWizard {
    constructor(
        private readonly keyboard: KeyboardService,
        private readonly jobService: JobService,
        private readonly userService: UserService,
        private readonly taskService: TaskService,
        private readonly mailman: MailmanService,
    ) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        await this.keyboard.showAdminMenu(ctx);
        ctx.wizard.next();
    }

    @Action(adminMenuOption.createTasks)
    async createTasks(@Ctx() ctx: WizardContext) {
        const chatId = ctx.chat.id;
        const msg =
            "I created tasks for this week, you can check it by sending me the '/whoisonduty' command.";
        await this.taskService.createTasks(chatId);
        await ctx.editMessageText(msg);
    }

    @Action(adminMenuOption.sendNotifications)
    async sendPmNotifications(@Ctx() ctx: WizardContext) {
        const chatId = ctx.chat.id;
        const tasks = await this.taskService.getTasksByStatus(
            chatId,
            taskStatus.pending,
        );
        for (const task of tasks) {
            await this.mailman.sendMonPM(task);
        }
        await ctx.editMessageText("Private messages with tasks has been sent to users on duty.");
    }
}
