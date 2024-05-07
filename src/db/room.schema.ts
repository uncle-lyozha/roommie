import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Room {
    @Prop({ required: true })
    name: string;

    @Prop({ type: [{ type: String }] })
    users: string[];
    
    @Prop({ required: true })
    description: string;

    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export const RoomSchema = SchemaFactory.createForClass(Room);
