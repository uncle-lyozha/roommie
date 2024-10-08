import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";

@Schema()
export class Task {
    @Prop({ required: true })
    userName: string;

    @Prop({ required: true })
    chatId: number;

    @Prop({ required: true })
    TGId: number;

    @Prop({ required: true })
    jobName: string;

    @Prop({ required: true })
    jobId: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    status: string;

    @Prop({ required: true })
    date: Date;

    @Prop({ required: true })
    snoozedTimes: number;

    @Prop({ required: true })
    storyStep: string;
}

export type TaskDocument = HydratedDocument<Task>;
export type TaskType = TaskDocument & { _id: ObjectId };
export const TaskSchema = SchemaFactory.createForClass(Task);
