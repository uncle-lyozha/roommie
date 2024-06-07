import { TaskDocument } from "./schemas/task.schema";

export interface ITask {
    createTasks(chatId?: number): Promise<TaskDocument> | null;
    createTaskForJob(jobId: string): Promise<TaskDocument>
}