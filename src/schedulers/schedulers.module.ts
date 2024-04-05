import { Module } from "@nestjs/common";
import { SchedulersService } from "./schedulers.service";
import { ScheduleModule } from "@nestjs/schedule";
import { CalendModule } from "src/calend/calend.module";
import { CalendService } from "src/calend/calend.service";
import { DbModule } from "src/db/db.module";
import { DbService } from "src/db/db.service";

@Module({
    imports: [ScheduleModule.forRoot(), CalendModule, DbModule],
    providers: [SchedulersService, CalendService, DbService],
})
export class SchedulersModule {}
