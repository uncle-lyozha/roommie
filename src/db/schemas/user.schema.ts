import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";

@Schema()
export class User {
    @Prop({ required: true })
    userName: string;
    
    @Prop({ required: true })
    tgId: number;
    
    @Prop()
    rating: number;
}

export type UserDocument = HydratedDocument<User>;
export type UserType = UserDocument & { _id: ObjectId };
export const UserSchema = SchemaFactory.createForClass(User);
