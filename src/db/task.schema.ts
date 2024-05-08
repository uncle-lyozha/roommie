import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type TaskDocument = HydratedDocument<Task>;

@Schema()
export class Task {
    @Prop({required: true})
    userName: string;

    @Prop({required: true})
    chatId: number;

    @Prop({required: true})
    TGId: number;

    @Prop({required: true})
    area: string;

    @Prop({required: true})
    description: string;

    @Prop({required: true})
    status: string;

    @Prop({required: true})
    date: Date;

    @Prop({required: true})
    snoozedTimes: number;

    @Prop({required: true})
    storyStep: string;
}
export const TaskSchema = SchemaFactory.createForClass(Task);
