import { Injectable } from "@nestjs/common";
import { RoomType, TaskType, UserType } from "./db.types";
import { taskStatus } from "utils/const";
import { InjectModel } from "@nestjs/mongoose";
import { Task } from "./task.schema";
import { Model, ObjectId } from "mongoose";
import { CalendService } from "src/calend/calend.service";
import { User } from "./user.schema";
import { Room } from "./room.schema";

@Injectable()
export class DbService {
    constructor(
        @InjectModel("Task") private readonly taskModel: Model<Task>,
        @InjectModel("User") private readonly userModel: Model<User>,
        @InjectModel("Room") private readonly roomModel: Model<Room>,
        private readonly calendar: CalendService,
    ) {}

    async populateTasks(): Promise<void> {
        const calendar = await this.calendar.getCalendarData();
        if (!calendar) {
            console.error("Calendar data is missing.");
            throw new Error("Can not retrieve calendar data");
        }
        const date = new Date().toISOString();
        // const dateToCheck = date.split("T")[0];
        const dateToCheck = "2024-04-08"; // test config
        const events = calendar.items;
        let summary: string = "";
        for (const event of events) {
            if (dateToCheck === event.start.date) {
                summary += event.summary + "\n";
                let userName = event.summary.split(" ")[1];
                let user = await this.findUserByName(userName);
                let TGId = user.TG.tgId;
                let area = event.summary.split(" ")[0];
                let description = event.description as string;
                let status = taskStatus.new;
                let newTask = new this.taskModel({
                    userName: userName,
                    TGId: TGId,
                    area: area,
                    description: description,
                    status: status,
                    date: date,
                    snoozedTimes: 0,
                    storyStep: "monday",
                });
                // console.log(newTask)
                await newTask.save();
            }
        }
        console.log("New tasks added to db.");
    }

    async createTasks(): Promise<void> {
        const rooms: RoomType[] = await this.roomModel.find();
        if (rooms.length === 0) {
            console.log("No items in a Rooms collection");
        }
        rooms.forEach(async (room) => {
            let userInChargeIndex = room.currUserIndex;
            let userInCharge = room.users[userInChargeIndex];
            let user = await this.findUserByName(userInCharge);
            let TGId = user.TG.tgId;
            let area = room.name;
            let description = room.description;
            let status = taskStatus.new;
            let newTask = new this.taskModel({
                userName: userInCharge,
                TGId: TGId,
                area: area,
                description: description,
                status: status,
                date: new Date().toISOString(),
                snoozedTimes: 0,
                storyStep: "monday",
            });
            // console.log(newTask)
            await newTask.save();
        });
    }

    async addNewRoom(room: RoomType): Promise<void> {
        const name = room.name;
        const users = room.users;
        const currUserIndex = room.currUserIndex || 0;
        const newRoom = new this.roomModel({
            name,
            users,
            currUserIndex,
        });
        const result = newRoom.save();
        console.log(result);
    }

    async setFailedTaskStatuses(): Promise<void> {
        await this.taskModel.updateMany(
            {
                status: {
                    $in: [
                        taskStatus.new,
                        taskStatus.snoozed,
                        taskStatus.pending,
                    ],
                },
            },
            { status: taskStatus.failed },
        );
    }

    async setPendingTaskStatus(taskId: string): Promise<void> {
        await this.taskModel.findByIdAndUpdate(taskId, {
            status: taskStatus.pending,
        });
    }

    async setDoneTaskStatus(taskId: string): Promise<void> {
        await this.taskModel.findByIdAndUpdate(taskId, {
            status: taskStatus.done,
        });
    }

    async setSnoozedTaskStatus(taskId: string): Promise<void> {
        await this.taskModel.findByIdAndUpdate(taskId, {
            status: taskStatus.snoozed,
            $inc: { snoozedTimes: 1 },
        });
    }

    async deleteAllTasks(): Promise<void> {
        await this.taskModel.deleteMany();
    }

    async getTaskById(id: string): Promise<TaskType> {
        const task: TaskType | null = await this.taskModel.findById(id);
        if (task) {
            return task;
        } else {
            throw new Error(`Task ${id} not found in DB.`);
        }
    }

    async getNewTasks(): Promise<TaskType[]> {
        const tasks: TaskType[] = await this.taskModel.find({
            status: taskStatus.new,
        });
        return tasks;
    }
    async getPendingTasks(): Promise<TaskType[]> {
        const tasks: TaskType[] = await this.taskModel.find({
            status: {
                $in: [taskStatus.new, taskStatus.snoozed, taskStatus.pending],
            },
        });
        return tasks;
    }

    async getTaskStoryStep(taskId: string) {
        const task: TaskType | null = await this.taskModel.findById(taskId);
        if (task) {
            return task.storyStep;
        } else {
            throw new Error(`Task ${taskId} not found in DB.`);
        }
    }

    async setTaskStoryStep(taskId: string, step: string) {
        await this.taskModel.findByIdAndUpdate(taskId, {
            storyStep: step,
        });
    }

    private async findUserByName(userName: string): Promise<UserType> {
        let user: UserType | null = await this.userModel.findOne({
            name: userName,
        });
        if (user) {
            return user;
        } else {
            throw new Error(`User ${userName} not found in DB.`);
        }
    }
}
