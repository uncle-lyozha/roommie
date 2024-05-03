import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BotModule } from "./bot/bot.module";
import { DbModule } from "./db/db.module";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { CalendModule } from './calend/calend.module';
import { SchedulersModule } from './schedulers/schedulers.module';
import { ScenesModule } from './scenes/scenes.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.${process.env.NODE_ENV}.env`,
        }),
        MongooseModule.forRoot(process.env.MONGO),
        BotModule,
        DbModule,
        CalendModule,
        SchedulersModule,
        ScenesModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
