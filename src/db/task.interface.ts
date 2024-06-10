import { taskStatus } from "utils/const";
import { TaskDocument, TaskType } from "./schemas/task.schema";

export interface ITask {
    createTasks(chatId?: number): Promise<void>;
    createTaskForJob(jobId: string): Promise<TaskDocument>;
    setTaskStatus(taskId: string, status: taskStatus): Promise<void> | null;
    getTaskById(id: string): Promise<TaskType>;
    getTasksByStatus(chatId: number, status: taskStatus): Promise<TaskType[]>;
    getAllPendingTasks(): Promise<TaskType[]>;
    getTaskStoryStep(taskId: string): Promise<string>;
    setTaskStoryStep(taskId: string, step: string): Promise<TaskDocument>;
    deleteAllTasksForJob(jobId: string): Promise<void>;
    deleteTaskById(taskId: string): Promise<TaskDocument>;
}
