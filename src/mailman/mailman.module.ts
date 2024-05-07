import { Module } from '@nestjs/common';
import { MailmanService } from './mailman.service';
import { CallbackHandlers } from './callback.handlers';
import { DbService } from 'src/db/db.service';
import { DbModule } from 'src/db/db.module';
import { CalendService } from 'src/calend/calend.service';

@Module({
  imports: [DbModule],
  providers: [MailmanService, DbService, CalendService, CallbackHandlers]
})
export class MailmanModule {}
