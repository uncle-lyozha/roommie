import { Ctx, InjectBot, Wizard, WizardStep } from "nestjs-telegraf";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";

@Wizard("speak")
export class SpeakWizard {
    constructor(@InjectBot() private readonly bot: Telegraf<SceneContext>) {}

    private chatId: string;

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext) {
        const msg = "Please enter chatId you want to send a message to.";
        await ctx.reply(msg);
        ctx.wizard.next()
    }

    @WizardStep(2)
    async onChatId(@Ctx() ctx: WizardContext) {
        this.chatId = ctx.text;
        const msg = "Now enter your message";
        await ctx.reply(msg);
        ctx.wizard.next()
    }

    @WizardStep(3)
    async onMsg(@Ctx() ctx: WizardContext) {
        const msg = ctx.text;
        await this.bot.telegram.sendMessage(this.chatId, msg);
        await ctx.scene.leave();
    }
}
