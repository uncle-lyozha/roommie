import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

@Schema({ expires: "7d" })
export class Session {
    @Prop({ required: true })
    type: string;

    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    option: string;
}
export type TSession = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);
