import { Module } from "@nestjs/common";
import { SchedulersService } from "./schedulers.service";
import { ScheduleModule } from "@nestjs/schedule";
import { DbModule } from "src/db/db.module";
import { ScenesModule } from "src/scenes/scenes.module";
import { MailmanService } from "src/mailman/mailman.service";
import { UserService } from "src/db/user.service";
import { TaskService } from "src/db/task.service";
import { JobService } from "src/db/job.service";

@Module({
    imports: [ScheduleModule.forRoot(), DbModule, ScenesModule],
    providers: [
        SchedulersService,
        MailmanService,
        UserService,
        TaskService,
        JobService,
    ],
})
export class SchedulersModule {}
