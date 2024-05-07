import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type LoadDocument = HydratedDocument<Load>;

@Schema()
export class Load {
    @Prop({ required: true })
    TGId: number;

    @Prop({ required: true })
    taskId: string;
}

export const LoadSchema = SchemaFactory.createForClass(Load);
