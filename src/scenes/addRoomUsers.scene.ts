import {
    Action,
    Command,
    Ctx,
    Hears,
    InjectBot,
    Scene,
    SceneEnter,
    SceneLeave,
} from "nestjs-telegraf";
import { SceneContext } from "telegraf/typings/scenes";
import { DbService } from "src/db/db.service";

@Scene("addRoomUserScene")
export class addRoomUsers {
    constructor(private readonly db: DbService) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        await ctx.telegram.sendMessage(
            ctx.from.id,
            "Please enter a list of users who will be iterativly cleaning the room. The list must contain only Telegram usernames, devided by a comma and a whitespase.",
        );
    }

    @Hears(/.*/)
    async onAnswer(@Ctx() ctx: SceneContext) {
        console.log("session data: " + ctx.session.__scenes.current);
        await ctx.scene.leave();
    }
}
