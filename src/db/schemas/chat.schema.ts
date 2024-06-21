import { Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, ObjectId } from "mongoose";

@Schema()
export class Chat {}

export type TChat = HydratedDocument<Chat>;
export type ChatType = TChat & { _id: ObjectId };
export const ChatSchema = SchemaFactory.createForClass(Chat);
