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

@Scene("addNewRoomNameScene")
export class addNewRoomName {
    constructor(private readonly db: DbService) {}

    @SceneEnter()
    async enter(@Ctx() ctx: SceneContext) {
        await ctx.telegram.sendMessage(
            ctx.from.id,
            "Please enter a new room name (string).",
        );
    }

    @Hears(/.*/)
    async onAnswer(@Ctx() ctx: SceneContext) {
        const name = ctx.text;
        ctx.session.__scenes.current = name;
        await ctx.scene.enter('addRoomUsers')
    }
}
