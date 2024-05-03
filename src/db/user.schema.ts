import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({
        required: true,
        type: Object,
    })
    TG: {
        username: string;
        tgId: string;
    };

    @Prop()
    rating: number;
    
    @Prop()
    storyStep: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
