import { Module } from "@nestjs/common";
import { UpdateListeners } from "./listeners";
import { TelegrafModule } from "nestjs-telegraf";
import { Telegraf, session } from "telegraf";
import { DbModule } from "src/db/db.module";
import { DbService } from "src/db/db.service";
import { addNewRoom } from "src/scenes/addNewRoom.wizard";
import { MailmanService } from "src/mailman/mailman.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Commands } from "./commands";

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
        addNewRoom,
        DbService,
        MailmanService,
        KeyboardService,
    ],
})
export class BotModule {}
