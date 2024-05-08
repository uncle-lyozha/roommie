import { Module } from '@nestjs/common';
import { MailmanService } from './mailman.service';
import { CallbackHandlers } from './callback.handlers';
import { DbService } from 'src/db/db.service';
import { DbModule } from 'src/db/db.module';

@Module({
  imports: [DbModule],
  providers: [MailmanService, DbService, CallbackHandlers]
})
export class MailmanModule {}