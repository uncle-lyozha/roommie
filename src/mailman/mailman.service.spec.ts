import { Test, TestingModule } from '@nestjs/testing';
import { MailmanService } from './mailman.service';

describe('MailmanService', () => {
  let service: MailmanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailmanService],
    }).compile();

    service = module.get<MailmanService>(MailmanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
