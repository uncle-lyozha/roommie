import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, {
    Model,
    Mongoose,
    ObjectId,
    Schema,
    SchemaTypes,
    Types,
} from "mongoose";
import { Job } from "./schemas/job.schema";
import { JobType, UserType } from "./db.types";
import { actionMenuOption } from "utils/const";

@Injectable()
export class JobService {
    constructor(@InjectModel("Job") private readonly jobModel: Model<Job>) {}

    async addNewJob(job: JobType): Promise<void> {
        try {
            const name = job.name;
            const chatId = job.chatId;
            const users = job.users;
            const description = job.description;
            const currUserIndex = job.currUserIndex || 0;
            const newJob = new this.jobModel({
                name,
                chatId,
                users,
                description,
                currUserIndex,
            });
            const result = await newJob.save();
            console.log(`New job created:\n${result}.`);
        } catch (err) {
            console.error(err);
        }
    }

    async addUserToJob(
        chatId: number,
        jobId: Types.ObjectId,
        userId: Types.ObjectId,
    ): Promise<void> {
        try {
            await this.jobModel.findOneAndUpdate(
                { _id: jobId, chatId: chatId },
                { $push: { users: userId } },
                { new: true },
            );
            console.log(`User ${userId} added to ${jobId}.`);
        } catch (err) {
            console.error(err);
        }
    }

    async deleteUserFromJob(jobId: string, userId: Types.ObjectId) {
        try {
            const updatedJob = await this.jobModel.findByIdAndUpdate(
                jobId,
                { $pull: { users: { _id: userId } } },
                { new: true },
            );
            console.log(`User ${userId} removed from job ${jobId}.`);

            return updatedJob;
        } catch (err) {
            console.error(err);
        }
    }

    async deleteJob(jobId: string) {
        try {
            await this.jobModel.findByIdAndDelete(jobId);
            console.log(`Job with id ${jobId} deleted.`);
        } catch (err) {
            console.error(err);
        }
    }

    async editJobName(
        chatId: number,
        jobName: string,
        jobNewName: string,
    ): Promise<void> {
        try {
            await this.jobModel.findOneAndUpdate(
                { name: jobName, chatId: chatId },
                { $set: { name: jobNewName } },
                { new: true },
            );
            console.log(`Job name updated to ${jobNewName}.`);
        } catch (err) {
            console.error(err);
        }
    }

    async editJobDescription(
        chatId: number,
        jobName: string,
        jobNewDescr: string,
    ): Promise<void> {
        try {
            await this.jobModel.findOneAndUpdate(
                { name: jobName, chatId: chatId },
                { $set: { description: jobNewDescr } },
                { new: true },
            );
            console.log(`Description for ${jobName} updated.`);
        } catch (err) {
            console.error(err);
        }
    }

    async getAllJobs(chatId?: number): Promise<JobType[]> {
        let jobs: JobType[] = [];
        if (chatId) {
            jobs = await this.jobModel.find({ chatId });
        } else {
            jobs = await this.jobModel.find();
        }
        return jobs;
    }

    async getJobByName(chatId: number, name: string): Promise<JobType> {
        const job: JobType = await this.jobModel.findOne({
            name: name,
            chatId: chatId,
        });
        return job;
    }

    async getJobById(jobId: string): Promise<JobType> {
        const job: JobType = await this.jobModel
            .findById(jobId)
            .populate("users");
        return job;
    }

    async setNextUserOnDuty(
        jobId: string,
        dir: actionMenuOption,
    ): Promise<void> {
        const job = await this.jobModel.findById(jobId);
        const { users, currUserIndex } = job;
        let nextIndex: number;
        if (dir === actionMenuOption.moveUserFwd) {
            nextIndex = (currUserIndex + 1) % users.length;
        }
        if (dir === actionMenuOption.moveUserBck) {
            nextIndex = (currUserIndex - 1 + users.length) % users.length;
        }
        job.currUserIndex = nextIndex;
        await job.save();
        console.log(
            `Next user to shift in ${job.name} is ${job.users[nextIndex]}.`,
        );
    }

    async setUserOnDuty(jobId: string, userIndex: number) {
        const updatedJob = await this.jobModel.findByIdAndUpdate(jobId, {
            currUserIndex: userIndex,
        });
        return updatedJob;
    }

    async swapUsers(jobId: string, user1Id: string, user2Id: string) {
        const job = await this.jobModel.findById(jobId);
        if (!job) {
            console.log("Job not found");
        }

        const users: any = job.users;
        const index1 = users.findIndex(
            (userId) => userId._id.toString() === user1Id,
        );
        const index2 = users.findIndex(
            (userId) => userId._id.toString() === user2Id,
        );

        if (index1 === -1 || index2 === -1) {
            console.log("One or both users not found in the job");
        }

        const temp = users[index1];
        users[index1] = users[index2];
        users[index2] = temp;
        job.users = users;

        await job.save();
        return job;
    }
}
