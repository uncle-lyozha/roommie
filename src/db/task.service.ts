import { Injectable } from "@nestjs/common";
import { JobType, TaskType, UserType } from "./db.types";
import { taskStatus } from "utils/const";
import { InjectModel } from "@nestjs/mongoose";
import { Task } from "./schemas/task.schema";
import { Model } from "mongoose";
import { Job } from "./schemas/job.schema";
import { UserService } from "./user.service";

@Injectable()
export class TaskService {
    constructor(
        @InjectModel("Task") private readonly taskModel: Model<Task>,
        @InjectModel("Job") private readonly jobModel: Model<Job>,
        private readonly userService: UserService,
    ) {}

    async createTasks(chatId?: number): Promise<void> {
        let jobs: JobType[] = [];
        if (!chatId) {
            jobs = await this.jobModel.find();
        } else {
            jobs = await this.jobModel.find({ chatId: chatId });
        }
        if (jobs.length === 0) {
            console.log("No items in Jobs collection");
            return null;
        }
        for (const job of jobs) {
            let userInChargeIndex = job.currUserIndex;
            let userInCharge = job.users[userInChargeIndex];
            let user: UserType =
                await this.userService.findUserByName(userInCharge);
            let chatId = job.chatId;
            let TGId = user.tgId;
            let area = job.name;
            let description = job.description;
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
            console.log("New task added to db.");
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

    async getTaskById(id: string): Promise<TaskType> {
        const task: TaskType | null = await this.taskModel.findById(id);
        if (task) {
            return task;
        } else {
            throw new Error(`Task ${id} not found in DB.`);
        }
    }

    async getTasksByStatus(
        chatId: number,
        status: taskStatus,
    ): Promise<TaskType[]> {
        if (status === taskStatus.pending) {
            const tasks: TaskType[] = await this.taskModel.find({
                status: {
                    $in: [
                        taskStatus.new,
                        taskStatus.snoozed,
                        taskStatus.pending,
                    ],
                },
                chatId: chatId,
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
    async getAllPendingTasks(): Promise<TaskType[]> {
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
}
