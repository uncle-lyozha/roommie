import { Module } from "@nestjs/common";
import { MailmanService } from "./mailman.service";
import { MenuCbQueryHandler } from "./menu.handlers";
import { KeyboardService } from "src/services/keyboard.service";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { DbModule } from "src/db/db.module";
import { StoryCbQueryHandler } from "./story.handlers";
import { EditJobWizard } from "src/scenes/editJob.wizard";

@Module({
    imports: [DbModule],
    providers: [
        MailmanService,
        MenuCbQueryHandler,
        StoryCbQueryHandler,
        KeyboardService,
        JobService,
        TaskService,
        UserService,
        EditJobWizard
    ],
})
export class MailmanModule {}
