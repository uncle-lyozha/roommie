import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CalendService } from "src/calend/calend.service";
import { DbService } from "src/db/db.service";

@Injectable()
export class SchedulersService {
    constructor(
        private readonly calendar: CalendService,
        private readonly db: DbService,
    ) {}

    @Cron(CronExpression.EVERY_10_SECONDS, { timeZone: "Europe/Belgrade" })
    async handleCron() {
        console.log("10 sec.");
        // const calendar = await this.calendar.getCalendarData()
        // console.log(calendar)
        const newTasks = await this.db.populateTasks();
        console.log(newTasks);
    }
}
