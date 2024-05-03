import { Inject, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DbService } from "src/db/db.service";
import { CleaningQuest } from "src/scenes/cleaning.scene";

@Injectable()
export class SchedulersService {
    constructor(private readonly db: DbService) {}

    @Cron(CronExpression.EVERY_WEEK, { timeZone: "Europe/Belgrade" })
    async sundayEve() {
        await this.db.setFailedTaskStatuses();
        await this.db.createTasks();
    }

    @Cron("0 12 * * 1", { timeZone: "Europe/Belgrade" })
    async mondayNoon() {
        const newTasks = await this.db.getNewTasks();
        await this.mailman.sendChatMsg(newTasks);
        newTasks.forEach(async task => {
            await this.mailman.sendPrivateMsg(task);
        })
    }
}
