import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { MongooseModule } from "@nestjs/mongoose";
import { TaskSchema } from "./schemas/task.schema";
import { UserSchema } from "./schemas/user.schema";
import { JobSchema } from "./schemas/job.schema";
import { JobService } from "./job.service";
import { UserService } from "./user.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Task", schema: TaskSchema },
            { name: "User", schema: UserSchema },
            { name: "Job", schema: JobSchema },
        ]),
    ],
    providers: [TaskService, JobService, UserService],
    exports: [MongooseModule],
})
export class DbModule {}
