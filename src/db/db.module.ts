import { Module } from "@nestjs/common";
import { DbService } from "./db.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Task, TaskSchema } from "./schemas/task.schema";
import { UserSchema } from "./schemas/user.schema";
import { RoomSchema } from "./schemas/room.schema";

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
