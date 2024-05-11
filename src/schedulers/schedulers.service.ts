import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DbService } from "src/db/db.service";
import { MailmanService } from "src/mailman/mailman.service";
import { taskStatus } from "utils/const";

@Injectable()
export class SchedulersService {
    constructor(
        private readonly db: DbService,
        private readonly mailman: MailmanService,
    ) {}

    @Cron(CronExpression.EVERY_WEEK, { timeZone: "Europe/Belgrade" })
    async sundayEve() {
        //notification in chat about failers
    }

    @Cron("0 12 * * 1", { timeZone: "Europe/Belgrade" })
    async monday() {
        await this.db.setTaskStatus();
        await this.db.setNextUserOnDuty();
        await this.db.createTasks();
        const newTasks = await this.db.getTasksByStatus(taskStatus.pending);
        await this.mailman.sendChatMsg(newTasks);
        newTasks.forEach(async (task) => {
            await this.mailman.sendMonPM(task);
        });
    }

    @Cron("0 12 * * 4-6", { timeZone: "Europe/Belgrade" })
    async repeating() {
        const tasks = await this.db.getTasksByStatus(taskStatus.pending);
        tasks.forEach(async (task) => {
            await this.mailman.sendMonPM(task);
        });
    }

    @Cron("0 12 * * 7", { timeZone: "Europe/Belgrade" })
    async sunday() {
        const tasks = await this.db.getTasksByStatus(taskStatus.pending);
        tasks.forEach(async (task) => {
            await this.mailman.sendFinalPm(task);
        });
    }
}
