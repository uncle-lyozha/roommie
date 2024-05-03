import { Injectable } from "@nestjs/common";
import {
    Command,
    Ctx,
    Hears,
    Help,
    InjectBot,
    On,
    Start,
    TelegrafContextType,
    Update,
} from "nestjs-telegraf";
import { Context, Scenes, Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/typings/scenes";

@Injectable()
@Update()
export class BotService {
    constructor(@InjectBot() private readonly bot: Telegraf<SceneContext>) {
        // this.bot.telegram.setMyCommands([
        //     {
        //         command: "/help",
        //         description: "Help.",
        //     },
        //     {
        //         command: "/addNewRoom",
        //         description:
        //             "Add a new room for cleaning and maintain a schedule there.",
        //     },
        // ]);
    }

    @Start()
    async start(@Ctx() ctx: Context) {
        await ctx.reply("Welcome");
    }

    @Help()
    async help(@Ctx() ctx: Context) {
        await ctx.reply("Help yourself, sucker!");
    }

    @On("sticker")
    async on(@Ctx() ctx: Context) {
        await ctx.reply("👍");
    }

    @Hears("hi")
    async hears(@Ctx() ctx: Context) {
        await ctx.reply("Hey there 👋");
    }

    @Command("addNewRoom")
    async startScene(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter("addNewRoom");
    }

    @Hears(["dice", "Dice", "кинь кости", "кости", "кубики"])
    async dice(@Ctx() ctx: Context) {
        const diceMsg = await ctx.replyWithDice();
        const diceValue = diceMsg.dice.value;
        console.log(diceValue);
    }

    @Command("scene")
    async isActive(@Ctx() context: SceneContext) {
        // Check if a scene is active
        if (context.scene && context.scene.current) {
            // Scene is active
            const activeSceneName = context.scene.current.id;
            console.log(`Active scene: ${activeSceneName}`);
        } else {
            // No scene is active
            console.log("No active scene");
        }

        // Other handler logic...
    }
}
