import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";
import { UserType } from "./user.schema";

@Schema()
export class Job {
    @Prop({ required: true })
    name: string;
    
    @Prop({ required: true })
    chatId: number;
    
    @Prop({ required: true, default: [] })
    users: UserType[];
    
    @Prop({ required: true })
    description: string;
    
    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export type JobDocument = HydratedDocument<Job>;
export type JobType = JobDocument & { _id: ObjectId };
export const JobSchema = SchemaFactory.createForClass(Job);
