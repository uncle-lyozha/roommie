import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DbService } from "src/db/db.service";
import { CleaningQuest } from "src/scenes/cleaning.scene";

@Injectable()
export class SchedulersService {
    constructor(
        private readonly db: DbService,
        private readonly storyScene: CleaningQuest,
    ) {}

    @Cron(CronExpression.EVERY_MINUTE, { timeZone: "Europe/Belgrade" })
    async handleCron() {
        // console.log("Test.");
        // await this.db.setFailedTaskStatuses();
        // await this.db.populateTasks();
        const newTasks = await this.db.getNewTasks();
        for (const task of newTasks) {
            await this.storyScene.enter(task);
        }
    }
}
