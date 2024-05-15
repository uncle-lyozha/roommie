import { Injectable } from "@nestjs/common";
import { Ctx, Hears, On, Update } from "nestjs-telegraf";
import { Context } from "telegraf";

@Injectable()
@Update()
export class UpdateListeners {
    constructor() {}

    @On("sticker")
    async on(@Ctx() ctx: Context) {
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
}
