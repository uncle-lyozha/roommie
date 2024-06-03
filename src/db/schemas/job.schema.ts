import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId, Types } from "mongoose";

@Schema()
export class Job {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    chatId: number;

    @Prop({ required: true, default: [] })
    users: ObjectId[];
    // users: { type: Types.ObjectId, ref: 'User' }[];

    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export const JobSchema = SchemaFactory.createForClass(Job);
