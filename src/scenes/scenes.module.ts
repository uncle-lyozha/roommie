import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { DbModule } from "src/db/db.module";

@Module({
    imports: [TelegrafModule, DbModule],
    providers: [DbService],
})
export class ScenesModule {}
