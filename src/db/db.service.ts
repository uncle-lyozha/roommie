import { Injectable } from "@nestjs/common";
import { RoomType, TaskType, UserType } from "./db.types";
import { taskStatus } from "utils/const";
import { InjectModel } from "@nestjs/mongoose";
import { Task } from "./task.schema";
import { Model, ObjectId } from "mongoose";
import { User } from "./user.schema";
import { Room } from "./room.schema";

@Injectable()
export class DbService {
    constructor(
        @InjectModel("Task") private readonly taskModel: Model<Task>,
        @InjectModel("User") private readonly userModel: Model<User>,
        @InjectModel("Room") private readonly roomModel: Model<Room>,
    ) {}

    async addNewRoom(room: RoomType): Promise<void> {
        try {
            const name = room.name;
            const chatId = room.chatId;
            const users = room.users;
            const description = room.description;
            const currUserIndex = room.currUserIndex || 0;
            const newRoom = new this.roomModel({
                name,
                chatId,
                users,
                description,
                currUserIndex,
            });
            const result = await newRoom.save();
            console.log(`New room added:\n${result}`);
        } catch (err) {
            console.error(err);
        }
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
            let chatId = room.chatId;
            let TGId = user.tgId;
            let area = room.name;
            let description = room.description;
            let status = taskStatus.new;
            let newTask = new this.taskModel({
                userName: userInCharge,
                chatId: chatId,
                TGId: TGId,
                area: area,
                description: description,
                status: status,
                date: new Date().toISOString(),
                snoozedTimes: 0,
                storyStep: "monday",
            });
            await newTask.save();
            console.log("New tasks added to db.");
        });
    }

    async setNextUserOnDuty(roomName?: string): Promise<void> {
        const rooms: RoomType[] = await this.roomModel.find();
        if (rooms.length === 0) {
            console.log("No rooms found in DB.");
        }
        rooms.forEach(async (room) => {
            const { users, currUserIndex } = room;
            const nextIndex = (currUserIndex + 1) % users.length;
            console.log(
                `Next userIndex to shift in ${room.name} is ${nextIndex}.`,
            );
            await this.roomModel.findOneAndUpdate(
                { name: room.name },
                { currUserIndex: nextIndex },
            );
        });
    }

    async createUser(name: string, tgId: number) {
        const newUser = new this.userModel({
            userName: name,
            tgId: tgId,
        });
        const result = await newUser.save();
        console.log(`New user created:\n ` + result);
    }

    async addUserToRoom(
        chatId: number,
        roomName: string,
        userName: string,
    ): Promise<void> {
        try {
            const updatedroom: RoomType = await this.roomModel.findOneAndUpdate(
                { name: roomName, chatId: chatId },
                { $push: { users: userName } },
                { new: true },
            );
            console.log(updatedroom);
        } catch (err) {
            console.error(err);
        }
    }

    async setTaskStatus(status?: taskStatus, taskId?: string): Promise<void> {
        try {
            if (status === taskStatus.new) {
                return;
            }

            if (status === taskStatus.failed) {
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

            if (status === taskStatus.pending) {
                await this.taskModel.findByIdAndUpdate(taskId, {
                    status: taskStatus.pending,
                });
            }

            if (status === taskStatus.snoozed) {
                await this.taskModel.findByIdAndUpdate(taskId, {
                    status: taskStatus.snoozed,
                    $inc: { snoozedTimes: 1 },
                });
            }

            if (status === taskStatus.done) {
                await this.taskModel.findByIdAndUpdate(taskId, {
                    status: taskStatus.done,
                });
            }
            console.log("Status updated succesfully.");
        } catch (err) {
            console.error(err);
        }
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

    async getTasksByStatus(status: taskStatus): Promise<TaskType[]> {
        if (status === taskStatus.pending) {
            const tasks: TaskType[] = await this.taskModel.find({
                status: {
                    $in: [
                        taskStatus.new,
                        taskStatus.snoozed,
                        taskStatus.pending,
                    ],
                },
            });
            return tasks;
        }
        // if (status === taskStatus.new) {
        //     const tasks: TaskType[] = await this.taskModel.find({
        //         status: taskStatus.new,
        //     });
        //     return tasks;
        // }
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

    async findUserByName(name: string): Promise<UserType> {
        const user: UserType = await this.userModel.findOne({
            userName: name,
        });
        if (user) {
            return user;
        } else {
            console.error(`User ${name} not found in DB.`);
        }
    }
}
