import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { MongooseModule } from "@nestjs/mongoose";
import { TaskSchema } from "./schemas/task.schema";
import { UserSchema } from "./schemas/user.schema";
import { JobSchema } from "./schemas/job.schema";
import { JobService } from "./job.service";
import { UserService } from "./user.service";
import { SessionSchema } from "./schemas/session.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Task", schema: TaskSchema },
            { name: "User", schema: UserSchema },
            { name: "Job", schema: JobSchema },
            { name: "Session", schema: SessionSchema },
        ]),
    ],
    providers: [TaskService, JobService, UserService],
    exports: [MongooseModule],
})
export class DbModule {}
