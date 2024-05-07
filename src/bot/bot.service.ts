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
import { DbService } from "src/db/db.service";
import { Context, Scenes, Telegraf } from "telegraf";
import { CallbackQuery } from "telegraf/typings/core/types/typegram";
import { SceneContext, WizardContext } from "telegraf/typings/scenes";
import { taskStatus } from "utils/const";

@Injectable()
@Update()
export class BotService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly db: DbService,
    ) {
        this.initializeBotCommands();
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

    @Command("add_new_room")
    async startScene(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter("addnewroom");
    }

    @Hears(["dice", "Dice", "кинь кости", "кости", "кубики"])
    async dice(@Ctx() ctx: Context) {
        const diceMsg = await ctx.replyWithDice();
        const diceValue = diceMsg.dice.value;
        console.log(diceValue);
    }

    @Command("create_tasks")
    async creatTasks() {
        await this.db.createTasks();
    }

    @Command("scene")
    async isActive(@Ctx() context: SceneContext) {
        if (context.scene && context.scene.current) {
            // Scene is active
            const activeSceneName = context.scene;
            console.log(`Active scene: ${activeSceneName}`);
        }
        if (context.session.__scenes.current) {
            // Scene is active
            const activeSceneName = context.session.__scenes.current;
            console.log(`Active scene: ${activeSceneName}`);
        }
        if (context.scene.current) {
            // Scene is active
            const activeSceneName = context.scene.current.id;
            console.log(`Active scene: ${activeSceneName}`);
        } else {
            // No scene is active
            console.log("No active scene");
        }

        // Other handler logic...
    }

    @On("callback_query")
    async onCallbackQuery(@Ctx() ctx: CallbackQuery) {
        const data = ctx.message;
        console.log(data);
    }

    async initializeBotCommands() {
        try {
            const commands = [
                { command: "start", description: "Start the bot" },
                { command: "help", description: "Get help" },
                {
                    command: "add_new_room",
                    description: "Add a new room for cleaning.",
                },
                {
                    command: "create_tasks",
                    description: "Create tasks for all rooms.",
                },
            ];
            await this.bot.telegram.setMyCommands(commands);
        } catch (error) {
            console.error("Error setting bot commands:", error);
        }
    }
}
