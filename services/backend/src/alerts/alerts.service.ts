import { Inject, Injectable } from '@nestjs/common';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class AlertsService {
  constructor(
    @Inject('NAVIGATION_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  create(createAlertDto: CreateAlertDto) {
    return this.client.send('createAlert', createAlertDto).pipe(
      retry(3),
      catchError((err) => {
        console.error('Failed to create alert:', err);
        return of(null);
      }),
    );
  }

  findAll() {
    return this.client.send('findAllAlerts', {}).pipe(
      retry(3),
      catchError((err) => {
        console.error('Failed to get alerts:', err);
        return of([]);
      }),
    );
  }

  findOne(id: number) {
    return this.client.send('findOneAlert', id);
  }

  update(id: number, updateAlertDto: UpdateAlertDto) {
    return this.client.send('updateAlert', { id, updateAlertDto });
  }

  remove(id: number) {
    return this.client.send('removeAlert', id);
  }
}
