import { Injectable } from '@nestjs/common';
import { Ctx, Hears, Help, On, Start, TelegrafContextType } from 'nestjs-telegraf';
import { Context } from 'telegraf';

@Injectable()
export class BotService {

    @Start()
    async start(@Ctx() ctx: Context) {
      await ctx.reply('Welcome');
    }
  
    @Help()
    async help(@Ctx() ctx: Context) {
      await ctx.reply('Send me a sticker');
    }
  
    @On('sticker')
    async on(@Ctx() ctx: Context) {
      await ctx.reply('👍');
    }
  
    @Hears('hi')
    async hears(@Ctx() ctx: Context) {
      await ctx.reply('Hey there');
    }
}
