import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getLandingPage: jest.fn().mockReturnValue('Landing Page Content'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('getLandingPage', () => {
    it('should return landing page content', () => {
      const result = 'Landing Page Content';
      jest.spyOn(appService, 'getLandingPage').mockImplementation(() => result);

      expect(appController.getLandingPage()).toBe(result);
    });
  });
});
