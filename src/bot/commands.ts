import { Inject, Injectable } from "@nestjs/common";
import {
    Ctx,
    Help,
    InjectBot,
    Sender,
    Start,
    Update,
    Command,
} from "nestjs-telegraf";
import { TaskService } from "src/db/task.service";
import { MailmanService } from "src/mailman/mailman.service";
import { KeyboardService } from "src/services/keyboard.service";
import { Context, Telegraf } from "telegraf";
import { SceneContext } from "telegraf/scenes";
import { taskStatus } from "utils/const";
import { UserService } from "src/db/user.service";
import { JobService } from "src/db/job.service";

@Injectable()
@Update()
export class Commands {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        @Inject(KeyboardService) private readonly keyboard: KeyboardService,
        private readonly taskService: TaskService,
        private readonly userService: UserService,
        private readonly jobService: JobService,
        private readonly mailman: MailmanService,
    ) {
        this.initializeBotCommands();
    }

    async initializeBotCommands() {
        const commands = [
            { command: "help", description: "How this all works?" },
            {
                command: "menu",
                description:
                    "Show a menu, where you can see info, edit and add a job.",
            },
            { command: "whoisonduty", description: "Who is on duty today?" },
            {
                command: "start",
                description:
                    "Hit this command to add yourself to the users list.",
            },
            {
                command: "sendChatMessage",
                description:
                    "Admins only. Go to a private chat with Roommie to compose with him a message to thisId? group chat.",
            },
        ];
        await this.bot.telegram.deleteMyCommands();
        await this.bot.telegram.setMyCommands(commands, {
            scope: { type: "all_group_chats" },
        });
    }

    @Start()
    async start(
        @Ctx() ctx: Context,
        @Sender("id") id: number,
        @Sender("username") userName: string,
    ) {
        userName = "@" + userName;
        const user = await this.userService.findUserByName(userName);
        if (user) {
            console.log("User already exists: \n" + user);
            await ctx.reply(
                "You are already in the users list, you don't need to use this command anymore. Try something new.",
            );
        } else {
            await ctx.reply(`Welcome ${userName}`);
            const newUser = await this.userService.createUser(userName, id);
        }
    }

    @Help()
    async help(@Ctx() ctx: Context) {
        const msg = `
        First, all users must click "Start" button in private message with Roommie so the bot
        could send private messages and a user's ID will be saved.
        `;
        await ctx.reply(msg);
    }

    @Command("menu")
    async showRooms(@Ctx() ctx: SceneContext) {
        await ctx.scene.enter("menu");
    }

    @Command("whoisonduty")
    async whoIsOnDuty(@Ctx() ctx: Context) {
        const chatId = ctx.chat.id;
        const tasks = await this.taskService.getTasksByStatus(
            chatId,
            taskStatus.pending,
        );
        if (tasks.length === 0) {
            await this.bot.telegram.sendMessage(
                chatId,
                "No tasks left. Well done everybody!",
            );
            return;
        }
        await this.mailman.sendChatDutyNotification(chatId, tasks);
    }

    // Commands available only to chat creator/admin

    @Command("sendChatMessage")
    async createTasks(
        @Ctx() ctx: Context,
        @Sender("id") userId: number,
        @Sender("username") userName: string,
    ) {
        
    }

    @Command("test")
    async test(
        @Ctx() ctx: SceneContext,
        @Sender("id") userId: number,
        @Sender("username") userName: string,
    ) {
        const chatId = ctx.chat.id;
        if (await this.isAdmin(chatId, userId, ctx)) {
            // const testTasks = await this.db.getPendingTasks();
            // await this.db.setNextUserOnDuty();
            const tasks = await this.taskService.getTasksByStatus(
                chatId,
                taskStatus.pending,
            );
            if (tasks.length === 0) {
                await this.bot.telegram.sendMessage(
                    chatId,
                    "No tasks left. Well done everybody!",
                );
                return;
            }
            for (const task of tasks) {
                await this.mailman.sendMonPM(task);
            }
            // tasks.forEach(async (task) => {
            //     await this.db.setTaskStatus(taskStatus.failed, task._id.toString());
            // });
            // await this.db.addUserToRoom(chatId, "WC", "@Lyozha2");
            // await this.db.findUserByName("Lyozha");
            // await ctx.scene.enter('test')
        } else {
            await ctx.reply(
                `${userName} is not authorised to use this command.`,
            );
        }
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
