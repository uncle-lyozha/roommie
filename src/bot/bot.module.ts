import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { TelegrafModule } from "nestjs-telegraf";
import { Telegraf, session } from "telegraf";
import { addNewRoomName } from "src/scenes/addRoomName.scene";
import { DbModule } from "src/db/db.module";
import { DbService } from "src/db/db.service";
import { CalendService } from "src/calend/calend.service";
import { addRoomUsers } from "src/scenes/addRoomUsers.scene";
import { addNewRoom } from "src/scenes/addNewRoom.wizard";

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
    providers: [BotService, addNewRoom, addNewRoomName, addRoomUsers, DbService, CalendService],
})
export class BotModule {}
