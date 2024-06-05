import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
    @Prop({ required: true })
    userName: string;

    @Prop({ required: true })
    tgId: number;

    @Prop()
    rating: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
