import { Injectable } from "@nestjs/common";
import { Ctx, InjectBot } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { RoomType } from "src/db/db.types";
import { Context, Markup, Telegraf } from "telegraf";

@Injectable()
export class KeyboardService {
    constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
        private readonly db: DbService,
    ) {}

    async showRoomKeyboard(@Ctx() ctx: Context, chatId: number) {
        const rooms = await this.db.getThisChatAllRooms(chatId);
        let buttons = rooms.map((room) =>
            Markup.button.callback(room.name, `rooms:${room.name}`),
        );
        if (buttons.length === 0) {
            await ctx.reply("No rooms added to DB.");
        }
        await ctx.reply(
            "Choose a room to see info or edit:",
            Markup.inlineKeyboard(buttons, { columns: 3 }),
        );
    }

    async hideKeyboard(@Ctx() context: Context) {
        await context.editMessageReplyMarkup({ reply_markup: { remove_keyboard: true } } as any);
    }
}
