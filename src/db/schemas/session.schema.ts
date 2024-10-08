import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ timestamps: true }) // Enables `createdAt` and `updatedAt` fields automatically
export class Session {
    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    option: string;

    @Prop({ default: Date.now, expires: "7d" }) // TTL index with expiration after 7 days
    createdAt: Date; // MongoDB uses this field for the TTL
}

export type TSession = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);
