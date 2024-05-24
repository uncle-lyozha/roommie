import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ObjectId } from "mongoose";

@Schema()
export class Job {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    chatId: number;

    @Prop({ required: true, default: [] })
    users: ObjectId[];

    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export const JobSchema = SchemaFactory.createForClass(Job);
