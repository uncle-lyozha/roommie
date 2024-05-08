import { Module } from "@nestjs/common";
import { SchedulersService } from "./schedulers.service";
import { ScheduleModule } from "@nestjs/schedule";
import { DbModule } from "src/db/db.module";
import { DbService } from "src/db/db.service";
import { ScenesModule } from "src/scenes/scenes.module";
import { MailmanService } from "src/mailman/mailman.service";

@Module({
    imports: [ScheduleModule.forRoot(), DbModule, ScenesModule],
    providers: [SchedulersService, DbService, MailmanService],
})
export class SchedulersModule {}
