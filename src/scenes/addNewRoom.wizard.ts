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
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly db: DbService,
    ) {}

    private room: RoomType = {
        name: "",
        chatId: 0,
        users: [],
        description: "",
        currUserIndex: 0,
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
            `Please enter a list of users who will be cleaning the ${roomName}. The list must contain only Telegram usernames (without @), devided by a whitespase.`,
        );
        ctx.wizard.next();
    }

    @WizardStep(3)
    @On("text")
    async onRoomUsers(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        const users = ctx.text;
        const invalidUsers = []
        for (const name of users.split(" ")) {
            const user = await this.db.findUserByName(name);
            if (!user) {
                invalidUsers.push(name);
            } else {
                this.room.users.push(user.userName);
            }
        }
        if (invalidUsers.length > 0) {
            const invalidUsersString = invalidUsers.join(", ");
            await ctx.reply(`Users: ${invalidUsersString} not found. Please add the usernames to the list of chat users.`);
            this.room.users = []; 
            return ctx.scene.reenter(); 
        }

        await ctx.reply(`Please enter a description for the new room.`);
        ctx.wizard.next();
    }

    @WizardStep(4)
    @On("text")
    async onRoomDesc(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        this.room.description = ctx.text;
        await this.db.addNewRoom(this.room);
        await ctx.reply(`Room ${this.room.name} added.`)
        await ctx.scene.leave();
    }
}
