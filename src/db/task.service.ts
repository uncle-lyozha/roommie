import { Injectable } from "@nestjs/common";
import { taskStatus } from "utils/const";
import { InjectModel } from "@nestjs/mongoose";
import { Task, TaskDocument, TaskType } from "./schemas/task.schema";
import { Model } from "mongoose";
import { Job, JobType } from "./schemas/job.schema";
import { UserType } from "./schemas/user.schema";
import { ITask } from "./task.interface";

@Injectable()
export class TaskService implements ITask {
    constructor(
        @InjectModel("Task") private readonly taskModel: Model<Task>,
        @InjectModel("Job") private readonly jobModel: Model<Job>,
    ) {}

    async createTasks(chatId?: number): Promise<void> {
        let jobs: JobType[] = [];
        if (!chatId) {
            // jobs = await this.jobModel.find().lean().populate("users");
            jobs = await this.jobModel.find();
        } else {
            jobs = await this.jobModel.find({ chatId: chatId });
            // .lean()
            // .populate("users");
        }
        if (jobs.length === 0) {
            console.log("No items in Jobs collection");
            return null;
        }
        for (const job of jobs) {
            let userInChargeIndex = job.currUserIndex;
            let user: UserType = job.users[userInChargeIndex];
            let chatId = job.chatId;
            let TGId = user.tgId;
            let jobName = job.name;
            let description = job.description;
            let status = taskStatus.new;
            let newTask = new this.taskModel({
                userName: user.userName,
                chatId: chatId,
                TGId: TGId,
                jobName: jobName,
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

    async createTaskForJob(jobId: string): Promise<TaskDocument> {
        const job: JobType = await this.jobModel.findById(jobId);
        const currentUser: UserType = job.users[job.currUserIndex];
        const newTask = new this.taskModel({
            userName: currentUser.userName,
            chatId: job.chatId,
            TGId: currentUser.tgId,
            jobName: job.name,
            description: job.description,
            status: taskStatus.new,
            date: new Date().toISOString(),
            snoozedTimes: 0,
            storyStep: "monday",
        });
        const result: TaskDocument = await newTask.save();
        console.log("New task added to db: \n" + result.jobName);
        return result;
    }

    async setTaskStatus(
        taskId: string,
        status: taskStatus,
    ): Promise<void> | null {
        try {
            let result: TaskDocument;
            if (status === taskStatus.new) {
                return null;
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

    async getTaskStoryStep(taskId: string): Promise<string> {
        const task: TaskType | null = await this.taskModel.findById(taskId);
        if (task) {
            return task.storyStep;
        } else {
            console.error(`Task ${taskId} not found in DB.`);
        }
    }

    async setTaskStoryStep(
        taskId: string,
        step: string,
    ): Promise<TaskDocument> {
        const result = await this.taskModel.findByIdAndUpdate(taskId, {
            storyStep: step,
        });
        return result;
    }

    async deleteAllTasksForJob(jobId: string): Promise<void> {
        await this.taskModel.deleteMany({
            _id: jobId,
            status: {
                $in: [taskStatus.new, taskStatus.snoozed, taskStatus.pending],
            },
        });
        console.log(`All pending tasks for ${jobId} deleted.`);
    }

    async deleteTaskById(taskId: string): Promise<TaskDocument> {
        const result: TaskDocument =
            await this.taskModel.findByIdAndDelete(taskId);
        console.log(`TaskId ${taskId} deleted.`);
        return result;
    }
}
