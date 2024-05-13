import { Injectable } from "@nestjs/common";
import {
    Command,
    Ctx,
    Hears,
    Help,
    InjectBot,
    On,
    Sender,
    Start,
    Update,
} from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { TaskType } from "src/db/db.types";
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
    async start(
        @Ctx() ctx: Context,
        @Sender("id") id: number,
        @Sender("username") userName: string,
    ) {
        const user = await this.db.findUserByName(userName);
        if (user) {
            console.log("User already exists: \n" + user);
            await ctx.reply(
                "You are already in the users list, you don't need to use this command anymore. Try something new.",
            );
        } else {
            await ctx.reply(`Welcome ${userName}`);
            const newUser = await this.db.createUser(userName, id);
        }
    }

    @Help()
    async help(@Ctx() ctx: Context) {
        // const msg = `
        // Available commands:
        // /test ~ test;
        // /start ~ Hit this command to add yourself to the users list;
        // /whoisonduty ~ Who is on duty today?
        // /add_new_room ~ Add a new room for cleaning;
        // /create_tasks ~ Create tasks for all rooms.
        // `
        // await ctx.replyWithMarkdownV2(msg)
    }

    @Command("add_new_room")
    async startScene(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter("addnewroom");
    }

    @Command("create_tasks")
    async creatTasks(
        @Ctx() ctx: Context,
        @Sender("id") userId: number,
        @Sender("username") userName: string,
    ) {
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            await this.db.createTasks();
        } else {
            await ctx.reply(
                `${userName} is not authorised to use this command.`,
            );
        }
    }

    @Command("test")
    async test(
        @Ctx() ctx: Context,
        @Sender("id") userId: number,
        @Sender("username") userName: string,
    ) {
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            console.log("admin route");
            // const testTasks = await this.db.getPendingTasks();
            // testTasks.forEach(async (task) => {
            //     await this.mailman.sendMonPM(task);
            // });
            // await this.db.setNextUserOnDuty();
            // const tasks = await this.db.getTasksByStatus(taskStatus.pending);
            // tasks.forEach(async (task) => {
            //     await this.db.setTaskStatus(taskStatus.failed, task._id.toString());
            // });
            // await this.db.addUserToRoom(chatId, "WC", "@Lyozha2");
            // await this.db.findUserByName("Lyozha");
        } else {
            await ctx.reply(
                `${userName} is not authorised to use this command.`,
            );
        }
    }

    @Command("whoisonduty")
    async whoIsOnDuty(@Ctx() ctx: Context) {
        const chatId = ctx.chat.id;
        const tasks = await this.db.getTasksByStatus(taskStatus.pending);
        if (tasks.length === 0) {
            await this.bot.telegram.sendMessage(
                chatId,
                "No tasks left. Well done everybody!",
            );
            return;
        }
        let tasksToSend: TaskType[];
        tasks.forEach((task) => {
            if (task.chatId === chatId) {
                tasksToSend.push(task);
            }
        });
        await this.mailman.sendChatDutyNotification(chatId, tasksToSend);
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
        const commands = [
            { command: "test", description: "test" },
            {
                command: "start",
                description:
                    "Hit this command to add yourself to the users list.",
            },
            { command: "help", description: "Get help" },
            { command: "whoisonduty", description: "Who is on duty today?" },
            {
                command: "add_new_room",
                description: "Add a new room for cleaning.",
            },
            {
                command: "create_tasks",
                description: "Create tasks for all rooms.",
            },
        ];
        this.bot.telegram.setMyCommands(commands);
    }
    private async isAdmin(
        chatId: number,
        userId: number,
        ctx: Context,
    ): Promise<boolean> {
        const chatMember = await ctx.telegram.getChatMember(chatId, userId);
        if (
            chatMember.status === "creator" ||
            chatMember.status === "administrator"
        ) {
            return true;
        } else {
            return false;
        }
    }
}
