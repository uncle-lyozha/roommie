import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Job, JobDocument, JobType } from "./schemas/job.schema";
import { actionMenuOption } from "utils/const";
import { UserType } from "./schemas/user.schema";
import { TJobDto } from "utils/utils.types";
import { UserService } from "./user.service";
import { IJob } from "./job.interface";

@Injectable()
export class JobService implements IJob {
    constructor(
        @InjectModel("Job") private readonly jobModel: Model<Job>,
        private readonly userService: UserService,
    ) {}

    async addNewJob(job: TJobDto): Promise<JobDocument> {
        try {
            const name = job.name;
            const chatId = job.chatId;
            const users = job.users;
            const description = job.description;
            const currUserIndex = 0;
            const newJob = new this.jobModel({
                name,
                chatId,
                users,
                description,
                currUserIndex,
            });
            const result = await newJob.save();
            console.log(`New job created:\n${result}.`);
            return result;
        } catch (err) {
            console.error(err);
        }
    }

    async addUserToJob(jobId: string, user: UserType): Promise<JobDocument> {
        try {
            const updatedJob: JobType = await this.jobModel
                .findByIdAndUpdate(
                    jobId,
                    { $push: { users: user } },
                    { new: true },
                )
                .lean()
                .populate("users");
            const userListLength = updatedJob.users.length;
            console.log(
                `User ${updatedJob.users[userListLength - 1].userName} added to ${updatedJob.name}.`,
            );
            return updatedJob;
        } catch (err) {
            console.error(err);
        }
    }

    async deleteUserFromJob(jobId: string, userId: string): Promise<UserType> {
        try {
            const user: UserType = await this.userService.findUserById(userId);
            const updatedJob: JobDocument =
                await this.jobModel.findByIdAndUpdate(
                    jobId,
                    {
                        $pull: { users: { _id: userId } },
                        $set: { currUserIndex: 0 },
                    },
                    { new: true },
                );
            console.log(
                `User ${user.userName} removed from job ${updatedJob.name}.`,
            );
            return user;
        } catch (err) {
            console.error(err);
        }
    }

    async deleteJob(jobId: string): Promise<JobDocument> {
        try {
            const result = await this.jobModel.findByIdAndDelete(jobId);
            console.log(`Job "${result.name}" deleted.`);
            return result;
        } catch (err) {
            console.error(err);
        }
    }

    async editJobName(jobId: string, jobNewName: string): Promise<JobDocument> {
        try {
            const updatedJob = await this.jobModel.findByIdAndUpdate(
                jobId,
                { $set: { name: jobNewName } },
                { new: true },
            );
            console.log(`Job name updated to "${updatedJob.name}".`);
            return updatedJob;
        } catch (err) {
            console.error(err);
        }
    }

    async editJobDescription(
        jobId: string,
        jobNewDescr: string,
    ): Promise<JobDocument> {
        try {
            const updatedJob = await this.jobModel.findByIdAndUpdate(
                jobId,
                { $set: { description: jobNewDescr } },
                { new: true },
            );
            console.log(`Description for "${updatedJob.name}" updated.`);
            return updatedJob;
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
            .lean()
            .populate("users");
        return job;
    }

    async setNextUserOnDuty(
        jobId: string,
        dir: actionMenuOption,
    ): Promise<void> {
        const job: JobType = await this.jobModel.findById(jobId);
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

    async setUserOnDuty(
        jobId: string,
        userIndex: number,
    ): Promise<JobDocument> {
        const updatedJob = await this.jobModel.findByIdAndUpdate(jobId, {
            currUserIndex: userIndex,
        });
        return updatedJob;
    }

    async swapUsers(
        jobId: string,
        user1Id: string,
        user2Id: string,
    ): Promise<JobDocument> {
        const job: JobDocument = await this.jobModel.findById(jobId);
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
