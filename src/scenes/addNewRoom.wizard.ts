import {
    Ctx,
    InjectBot,
    On,
    Sender,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { RoomType } from "src/db/db.types";
import { Context, Telegraf } from "telegraf";
// import { SceneContext, WizardContext } from "telegraf/typings/scenes";
import { SceneContext, WizardContext } from "telegraf/scenes";

@Wizard("addnewroom")
export class addNewRoom {
    constructor(@InjectBot() private readonly bot: Telegraf<SceneContext>, private readonly db: DbService) {}

    private room: RoomType = {
        name: "",
        chatId: 0,
        users: [],
        description: "",
        currUserIndex: 0
    };

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        await ctx.reply("Please enter a new room name (one word).");
        ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onRoomName(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        this.room.chatId = ctx.chat.id;
        const roomName = ctx.text;
        this.room.name = roomName;
        await ctx.reply(
            `Please enter a list of users who will be cleaning the ${roomName}. The list must contain only Telegram @usernames, devided by a whitespase.`,
        );
        ctx.wizard.next();
    }

    @WizardStep(3)
    @On("text")
    async onRoomUsers(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        const users = ctx.text;
        //validate users
        users.split(" ").forEach((user) => {
            this.room.users.push(user);
        });
        await ctx.reply(`Please enter a description for new room.`);
        ctx.wizard.next();
    }

    @WizardStep(4)
    @On("text")
    async onRoomDesc(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        this.room.description = ctx.text;
        await ctx.reply(`New room ${this.room.name} is added.`);
        await this.db.addNewRoom(this.room);
        await ctx.scene.leave();
    }
}
