import { Module } from "@nestjs/common";
import { MailmanService } from "./mailman.service";
import { KeyboardService } from "src/services/keyboard.service";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { DbModule } from "src/db/db.module";
import { StoryCbQueryHandler } from "./story.handlers";
import { addUserToJob } from "src/scenes/addUserToJob.wizard";
import { SessionService } from "src/db/session.service";
import { delUserFromJob } from "src/scenes/delUserFromJob.wizard";
import { delJob } from "src/scenes/delJob.wizard";
import { UpdateDescr } from "src/scenes/updateJobDescr.wizard";
import { EditJobName } from "src/scenes/editJobName.wizard";
import { AdminMenuWizard } from "src/scenes/adminMenu.wizard";
import { SpeakWizard } from "src/scenes/speak.wizard";

@Module({
    imports: [DbModule],
    providers: [
        MailmanService,
        StoryCbQueryHandler,
        KeyboardService,
        JobService,
        TaskService,
        UserService,
        addUserToJob,
        delUserFromJob,
        SessionService,
        delJob,
        UpdateDescr,
        EditJobName,
        AdminMenuWizard,
        SpeakWizard
    ],
})
export class MailmanModule {}
