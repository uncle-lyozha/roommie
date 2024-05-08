import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DbService } from "src/db/db.service";
import { MailmanService } from "src/mailman/mailman.service";

@Injectable()
export class SchedulersService {
    constructor(private readonly db: DbService, private readonly mailman: MailmanService) {}

    @Cron(CronExpression.EVERY_WEEK, { timeZone: "Europe/Belgrade" })
    async sundayEve() {
        await this.db.setFailedTaskStatuses();
        await this.db.createTasks();
    }

    @Cron("0 12 * * 1", { timeZone: "Europe/Belgrade" })
    async monday() {
        const newTasks = await this.db.getNewTasks();
        await this.mailman.sendChatMsg(newTasks);
        newTasks.forEach(async task => {
            await this.mailman.sendMonPM(task);
        })
    }
    @Cron("0 12 * * 4", { timeZone: "Europe/Belgrade" })
    async repeating() {
        const tasks = await this.db.getPendingTasks()
        tasks.forEach(async task => {
            await this.mailman.sendMonPM(task);
        })
    }
}
