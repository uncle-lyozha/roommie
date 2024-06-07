import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectBot } from "nestjs-telegraf";
import { JobService } from "src/db/job.service";
import { JobType } from "src/db/schemas/job.schema";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { MailmanService } from "src/mailman/mailman.service";
import { Telegraf } from "telegraf";
import { SceneContext } from "telegraf/scenes";
import { actionMenuOption, moveEnum, taskStatus } from "utils/const";

@Injectable()
export class SchedulersService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly userServise: UserService,
        private readonly jobService: JobService,
        private readonly taskService: TaskService,
        private readonly mailman: MailmanService,
    ) {}

    // @Cron(CronExpression.EVERY_MINUTE, { timeZone: "Europe/Belgrade" }) 
    // async test() {
    //     await this.bot.context.scene.enter("speak")
    // }

    @Cron(CronExpression.EVERY_WEEK, { timeZone: "Europe/Belgrade" })
    async sundayEve() {
        
        const pendingTasks = await this.taskService.getAllPendingTasks();
        if (pendingTasks) {
            for (const task of pendingTasks) {
                await this.taskService.setTaskStatus(
                    task._id.toString(),
                    taskStatus.failed,
                );
            }
        }
        const jobs: JobType[] = await this.jobService.getAllJobs();
        if (jobs) {
            for (const job of jobs) {
                const jobIdStr = job._id.toString()
                await this.jobService.setNextUserOnDuty(
                    jobIdStr,
                    actionMenuOption.moveUserFwd,
                );
                console.log(`Shift moved ffw for ${job.name}`);
            }
        }
    }

    @Cron("0 12 * * 1", { timeZone: "Europe/Belgrade" })
    async monday() {
        await this.taskService.createTasks();
        const newTasks = await this.taskService.getAllPendingTasks();
        if(newTasks) {
            await this.mailman.notifyAllChats(newTasks);
            newTasks.forEach(async (task) => {
                await this.mailman.sendMonPM(task);
            });
        } else {
            console.log("No new tasks found.")
        }
    }

    @Cron("0 12 * * 4-6", { timeZone: "Europe/Belgrade" })
    async repeating() {
        const tasks = await this.taskService.getAllPendingTasks();
        tasks.forEach(async (task) => {
            await this.mailman.sendMonPM(task);
        });
    }

    @Cron("0 12 * * 7", { timeZone: "Europe/Belgrade" })
    async sunday() {
        const tasks = await this.taskService.getAllPendingTasks();
        tasks.forEach(async (task) => {
            await this.mailman.sendFinalPm(task);
        });
    }
}
