/* eslint-disable @typescript-eslint/unbound-method */
import { ClientProxy } from '@nestjs/microservices';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertType } from './entities/alert.type';

describe('AlertsService', () => {
  let service: AlertsService;
  let clientProxy: ClientProxy;

  beforeEach(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [
        AlertsService,
        {
          provide: 'NAVIGATION_SERVICE',
          useValue: { send: jest.fn(), emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    clientProxy = module.get<ClientProxy>('NAVIGATION_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call client.send with createAlert and return value', (done) => {
      const dto: CreateAlertDto = {
        title: 'Test Alert',
        coordinates: {
          latitude: 0,
          longitude: 0,
          accuracy: 'rooftop',
        },
        description: 'Test description',
        date: new Date(),
        type: AlertType.INFO,
      };
      (clientProxy.send as jest.Mock).mockReturnValue(of('created'));
      service.create(dto).subscribe((result) => {
        expect(clientProxy.send).toHaveBeenCalledWith('createAlert', dto);
        expect(result).toBe('created');
        done();
      });
    });

    it('should return null on error', (done) => {
      (clientProxy.send as jest.Mock).mockReturnValue(
        throwError(() => new Error('fail')),
      );
      const dto: CreateAlertDto = {
        title: 'Test Alert',
        coordinates: {
          latitude: 0,
          longitude: 0,
          accuracy: 'rooftop',
        },
        description: 'Test description',
        date: new Date(),
        type: AlertType.INFO,
      };
      service.create(dto).subscribe((result) => {
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('findAll', () => {
    it('should call client.send with findAllAlerts and return value', (done) => {
      (clientProxy.send as jest.Mock).mockReturnValue(of(['a', 'b']));
      service.findAll().subscribe((result) => {
        expect(clientProxy.send).toHaveBeenCalledWith('findAllAlerts', {});
        expect(result).toEqual(['a', 'b']);
        done();
      });
    });

    it('should return [] on error', (done) => {
      (clientProxy.send as jest.Mock).mockReturnValue(
        throwError(() => new Error('fail')),
      );
      service.findAll().subscribe((result) => {
        expect(result).toEqual([]);
        done();
      });
    });
  });

  describe('findOne', () => {
    it('should call client.send with findOneAlert', () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of('alert'));
      service.findOne(1).subscribe((result) => {
        expect(clientProxy.send).toHaveBeenCalledWith('findOneAlert', 1);
        expect(result).toBe('alert');
      });
    });
  });

  describe('update', () => {
    it('should call client.send with updateAlert', () => {
      const dto: UpdateAlertDto = {
        id: 1,
        title: 'Test Alert',
        coordinates: {
          latitude: 0,
          longitude: 0,
          accuracy: 'rooftop',
        },
        description: 'Test description',
        date: new Date(),
        type: AlertType.INFO,
      };
      (clientProxy.send as jest.Mock).mockReturnValue(of('updated'));
      service.update(1, dto).subscribe((result) => {
        expect(clientProxy.send).toHaveBeenCalledWith('updateAlert', {
          id: 1,
          updateAlertDto: dto,
        });
        expect(result).toBe('updated');
      });
    });
  });

  describe('remove', () => {
    it('should call client.send with removeAlert', () => {
      (clientProxy.send as jest.Mock).mockReturnValue(of('removed'));
      service.remove(1).subscribe((result) => {
        expect(clientProxy.send).toHaveBeenCalledWith('removeAlert', 1);
        expect(result).toBe('removed');
      });
    });
  });
});
