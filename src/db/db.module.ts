import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Task, TaskSchema } from "./task.schema";
import { UserSchema } from "./user.schema";
import { RoomSchema } from "./room.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Task", schema: TaskSchema },
            { name: "User", schema: UserSchema },
            { name: "Room", schema: RoomSchema },
        ]),
    ],
    providers: [DbService],
    exports: [MongooseModule],
})
export class DbModule {}
