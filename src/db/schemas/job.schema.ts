import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId, Types } from "mongoose";
import { UserDocument } from "./user.schema";

export type JobDocument = HydratedDocument<Job>;
export type JobType = JobDocument & { _id: ObjectId };

@Schema()
export class Job {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    chatId: number;

    @Prop({ required: true, default: [] })
    // users: ObjectId[];
    users: UserDocument[];

    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export const JobSchema = SchemaFactory.createForClass(Job);
