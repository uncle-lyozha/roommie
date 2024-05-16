import { Ctx, InjectBot, Sender, Wizard, WizardStep } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";

@Wizard("adduser")
export class addNewUser {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        
    ) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        await ctx.reply("Please enter a new user name.");
        ctx.wizard.next();
    }

    @WizardStep(2)
    async onUserName(@Ctx() ctx: WizardContext) {}
}
