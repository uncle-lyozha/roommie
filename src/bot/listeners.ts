import { Injectable } from "@nestjs/common";
import { Ctx, Hears, Mention, On, Update } from "nestjs-telegraf";
import { UserService } from "src/db/user.service";
import { Context } from "telegraf";
import { newChatMemberType } from "utils/utils.types";

@Injectable()
@Update()
export class UpdateListeners {
    constructor(private readonly userService: UserService) {}

    @On("sticker")
    async onSticker(@Ctx() ctx: Context) {
        await ctx.reply("👍");
    }

    @Hears("hi")
    async hears(@Ctx() ctx: Context) {
        await ctx.reply("Hey there 👋");
    }

    @Hears(["dice", "Dice", "кинь кости", "кости", "кубики"])
    async dice(@Ctx() ctx: Context) {
        const diceMsg = await ctx.replyWithDice();
        const diceValue = diceMsg.dice.value;
        console.log(diceValue);
    }

    @On("new_chat_members")
    async greetNewMember(@Ctx() ctx: Context) {
        const update = ctx.message;
        const newMembers =
            "new_chat_members" in update ? update.new_chat_members : null;
        for (const user of newMembers) {
            const userName = "@" + user.username;
            const savedUser = await this.userService.findUserByName(userName);
            if (savedUser) {
                console.log("User already exists: " + user.username);
                await ctx.reply(
                    `Welcome back ${userName}. I remember you, you are ok.`,
                );
            } else {
                await ctx.reply(`Greetings ${userName} and welcome!`);
                const newUser = await this.userService.createUser(
                    userName,
                    user.id,
                );
            }
        }
    }
}
