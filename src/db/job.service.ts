import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Job } from "./schemas/job.schema";
import { JobType } from "./db.types";
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
        jobName: string,
        userName: string,
    ): Promise<void> {
        try {
            await this.jobModel.findOneAndUpdate(
                { name: jobName, chatId: chatId },
                { $push: { users: userName } },
                { new: true },
            );
            console.log(`User ${userName} added to ${jobName}.`);
        } catch (err) {
            console.error(err);
        }
    }

    async deleteUserFromJob(
        jobId: string,
        // chatId: number,
        // jobName: string,
        userName: string,
    ): Promise<void> {
        try {
            console.log('HIIIi!')
            await this.jobModel.findByIdAndUpdate(
                jobId,
                { $pull: { users: userName } },
                { new: true },
            );
            console.log(`User ${userName} removed from job ${jobId}.`);
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
        const job: JobType = await this.jobModel.findById(jobId);
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
}