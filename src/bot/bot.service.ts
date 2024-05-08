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
import { MailmanService } from "src/mailman/mailman.service";
import { Context, Scenes, Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/typings/scenes";
import { taskStatus } from "utils/const";

@Injectable()
@Update()
export class BotService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly db: DbService,
        private readonly mailman: MailmanService,
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

    @Command("add_new_room")
    async startScene(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter("addnewroom");
    }

    @Command("create_tasks")
    async creatTasks() {
        await this.db.createTasks();
    }

    @Command("test")
    async test() {
        const testTasks = await this.db.getPendingTasks();
        testTasks.forEach(async (task) => {
            await this.mailman.sendMonPM(task);
        });
    }

    @Command("whoisonduty")
    async whoIsOnDuty() {
        const tasks = await this.db.getPendingTasks();
        console.log(tasks)
        await this.mailman.sendChatMsg(tasks);
    }

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

    async initializeBotCommands() {
        try {
            const commands = [
                { command: "test", description: "test" },
                { command: "start", description: "Start the bot" },
                { command: "help", description: "Get help" },
                { command: "whoisonduty", description: "Who is on duty now?" },
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
