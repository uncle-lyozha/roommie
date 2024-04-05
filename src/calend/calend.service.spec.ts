import { Test, TestingModule } from '@nestjs/testing';
import { CalendService } from './calend.service';

describe('CalendService', () => {
  let service: CalendService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalendService],
    }).compile();

    service = module.get<CalendService>(CalendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
