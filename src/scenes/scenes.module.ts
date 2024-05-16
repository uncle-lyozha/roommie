import { Module } from "@nestjs/common";
import { TelegrafModule } from "nestjs-telegraf";
import { DbModule } from "src/db/db.module";

@Module({
    imports: [TelegrafModule, DbModule],
    providers: [],
})
export class ScenesModule {}
