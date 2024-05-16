import { Module } from "@nestjs/common";
import { UpdateListeners } from "./listeners";
import { TelegrafModule } from "nestjs-telegraf";
import { Telegraf, session } from "telegraf";
import { DbModule } from "src/db/db.module";
import { MailmanService } from "src/mailman/mailman.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Commands } from "./commands";
import { JobService } from "src/db/job.service";
import { TaskService } from "src/db/task.service";
import { UserService } from "src/db/user.service";
import { addNewJob } from "src/scenes/addNewJob.wizard";

@Module({
    imports: [
        TelegrafModule.forRootAsync({
            useFactory: () => ({
                token: process.env.BOT_TOKEN as string,
                middlewares: [session(), Telegraf.log()],
            }),
        }),
        DbModule,
    ],
    providers: [
        UpdateListeners,
        Commands,
        addNewJob,
        JobService,
        TaskService,
        UserService,
        MailmanService,
        KeyboardService,
    ],
})
export class BotModule {}
