import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

export type JobDocument = HydratedDocument<Job>;

@Schema()
export class Job {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    chatId: number;

    @Prop({ type: [{ type: Types.ObjectId, ref: "User" }], default: [] })
    users: Types.ObjectId[];

    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export const JobSchema = SchemaFactory.createForClass(Job);
