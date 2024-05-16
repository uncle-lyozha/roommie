import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Job {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    chatId: number;

    @Prop({ type: [{ type: String }] })
    users: string[];
    
    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export const JobSchema = SchemaFactory.createForClass(Job);
