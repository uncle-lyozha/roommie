import { Module } from "@nestjs/common";
import { SchedulersService } from "./schedulers.service";
import { ScheduleModule } from "@nestjs/schedule";
import { DbModule } from "src/db/db.module";
import { DbService } from "src/db/db.service";
import { CleaningQuest } from "src/scenes/cleaning.scene";
import { ScenesModule } from "src/scenes/scenes.module";
import { CalendModule } from "src/calend/calend.module";
import { CalendService } from "src/calend/calend.service";
import { MailmanService } from "src/mailman/mailman.service";

@Module({
    imports: [ScheduleModule.forRoot(), DbModule, ScenesModule, CalendModule],
    providers: [SchedulersService, DbService, CleaningQuest, CalendService, MailmanService],
})
export class SchedulersModule {}
