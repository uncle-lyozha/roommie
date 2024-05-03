import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { DbModule } from "src/db/db.module";
import { CalendService } from "src/calend/calend.service";

@Module({
    imports: [TelegrafModule, DbModule],
    providers: [DbService, CalendService],
})
export class ScenesModule {}
