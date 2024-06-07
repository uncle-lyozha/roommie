import { TJobDto } from "utils/utils.types";
import { JobDocument, JobType } from "./schemas/job.schema";
import { UserType } from "./schemas/user.schema";
import { actionMenuOption } from "utils/const";

export interface IJob {
    addNewJob(job: TJobDto): Promise<JobDocument>;
    addUserToJob(jobId: string, user: UserType): Promise<JobDocument>;
    deleteUserFromJob(jobId: string, userId: string): Promise<UserType>;
    deleteJob(jobId: string): Promise<JobDocument>;
    editJobName(jobId: string, jobNewName: string): Promise<JobDocument>;
    editJobDescription(
        jobId: string,
        jobNewDescr: string,
    ): Promise<JobDocument>;
    getAllJobs(chatId?: number): Promise<JobType[]>;
    getJobByName(chatId: number, name: string): Promise<JobType>;
    getJobById(jobId: string): Promise<JobType>;
    setNextUserOnDuty(jobId: string, dir: actionMenuOption): Promise<void>;
    setUserOnDuty(jobId: string, userIndex: number): Promise<JobDocument>;
    swapUsers(
        jobId: string,
        user1Id: string,
        user2Id: string,
    ): Promise<JobDocument>;
}
