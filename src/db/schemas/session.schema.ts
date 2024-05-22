import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ expires: 7 * 24 * 60 * 60 })
export class Session {

    @Prop({required: true})
    type: string;

    @Prop({required: true})
    id: string;

    @Prop({required: true})
    option: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
