import {
    Ctx,
    InjectBot,
    On,
    Sender,
    Wizard,
    WizardStep,
} from "nestjs-telegraf";
import { Context, Telegraf } from "telegraf";
// import { SceneContext, WizardContext } from "telegraf/typings/scenes";
import { SceneContext, WizardContext } from "telegraf/scenes";


@Wizard("addNewRoom")
export class addNewRoom {
    constructor(@InjectBot() private readonly bot: Telegraf<SceneContext>) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        await ctx.reply("Please enter a new room name (one word).");
        ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onRoomName(
        @Ctx() ctx: Context & WizardContext,
        @Sender("id") id: number,
    ) {
        const name = ctx.text;
        console.log("name0: " + name);
        ctx.session.__scenes.current = name;
        await ctx.reply(
            "Please enter a list of users who will be iterativly cleaning the room. The list must contain only Telegram usernames, devided by a comma and a whitespase.",
        );
        ctx.wizard.next();
    }

    @WizardStep(3)
    @On("text")
    async onRoomUsers(
        @Ctx() ctx: Context & WizardContext,
        @Sender("id") id: number,
    ) {
        await ctx.reply("Thank you.");
        const name = ctx.session.__scenes.current;
        console.log("name: " + name);
        const usersString = ctx.text;
        console.log(usersString);
        const users = usersString.split(", ");
        console.log(users);
        return ctx.scene.leave();
    }
}
