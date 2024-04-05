import { Module } from '@nestjs/common';
import { CalendService } from './calend.service';

@Module({
  providers: [CalendService]
})
export class CalendModule {}
