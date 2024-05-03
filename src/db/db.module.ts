import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Task, TaskSchema } from "./task.schema";
import { CalendModule } from "src/calend/calend.module";
import { UserSchema } from "./user.schema";
import { CalendService } from "src/calend/calend.service";
import { RoomSchema } from "./room.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Task", schema: TaskSchema },
            { name: "User", schema: UserSchema },
            { name: "Room", schema: RoomSchema },
        ]),
        CalendModule,
    ],
    providers: [DbService, CalendService],
    exports: [MongooseModule, CalendModule],
})
export class DbModule {}
