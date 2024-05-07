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

@Wizard("addnewroom")
export class addNewRoom {
    constructor(@InjectBot() private readonly bot: Telegraf<SceneContext>) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        await ctx.reply("Please enter a new room name (one word).");
        await ctx.wizard.next();
    }

    @WizardStep(2)
    @On("text")
    async onRoomName(
        @Ctx() ctx: WizardContext,
        @Sender("id") id: number,
    ) {
        const roomName = ctx.text;
        ctx.session.__scenes.current = roomName;
        await ctx.reply(
            `Please enter a list of users who will be cleaning the ${roomName}. The list must contain only Telegram @usernames, devided by a whitespase.`,
        );
        await ctx.wizard.next();
    }

    @WizardStep(3)
    @On("text")
    async onRoomUsers(
        @Ctx() ctx: WizardContext,
        @Sender("id") id: number,
    ) {
        const users = ctx.text;
        await ctx.reply(
            `Please enter a description for ${ctx.session.__scenes.current}.`,
        );
        ctx.session.__scenes.current =
            ctx.session.__scenes.current + ":" + users;
        await ctx.wizard.next();
    }

    @WizardStep(4)
    @On("text")
    async onRoomDesc(
        @Ctx() ctx: WizardContext,
        @Sender("id") id: number,
    ) {
        await ctx.reply("Thank you.");
        console.log(ctx.session.__scenes.current);
        console.log(ctx.text);
        await ctx.scene.leave();
    }
}
