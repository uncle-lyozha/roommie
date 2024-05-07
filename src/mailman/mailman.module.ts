import { Module } from '@nestjs/common';
import { MailmanService } from './mailman.service';
import { CallbackHandlers } from './callback.handlers';

@Module({
  providers: [MailmanService, CallbackHandlers]
})
export class MailmanModule {}
