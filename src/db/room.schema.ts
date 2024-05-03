import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Room {
    @Prop({ required: true })
    roomName: string;

    @Prop({ type: [{ type: String }] })
    users: string[];

    @Prop({ type: Number, default: 0 })
    currUserIndex: number;
}
export const RoomSchema = SchemaFactory.createForClass(Room);
