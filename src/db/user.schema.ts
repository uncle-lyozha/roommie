import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    @Prop({ required: true })
    userName: string;

    @Prop({
        required: true,
        type: Object,
    })
    tgId: string;

    @Prop()
    rating: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
