import { Module } from "@nestjs/common";
import { MailmanService } from "./mailman.service";
import { CallbackHandlers } from "./callback.handlers";
import { KeyboardService } from "src/services/keyboard.service";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { DbModule } from "src/db/db.module";

@Module({
    imports: [DbModule],
    providers: [
        MailmanService,
        CallbackHandlers,
        KeyboardService,
        JobService,
        TaskService,
        UserService,
    ],
})
export class MailmanModule {}
