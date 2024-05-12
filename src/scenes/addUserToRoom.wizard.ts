import { Ctx, InjectBot, Sender, Wizard, WizardStep } from "nestjs-telegraf";
import { DbService } from "src/db/db.service";
import { Telegraf } from "telegraf";
import { SceneContext, WizardContext } from "telegraf/scenes";

@Wizard('addusertoroom')
export class addUserToRoom {
    constructor(
        @InjectBot() private readonly bot: Telegraf<SceneContext>,
        private readonly db: DbService,
    ) {}

    @WizardStep(1)
    async onEnter(@Ctx() ctx: WizardContext, @Sender("id") id: number) {
        await ctx.reply("Please enter a new room name.");
        ctx.wizard.next();
    }
}