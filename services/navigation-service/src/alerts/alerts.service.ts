import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { Alert } from './entities/alert.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertsRepository: Repository<Alert>,
  ) {}

  async create(createAlertDto: CreateAlertDto): Promise<Alert> {
    const alert = this.alertsRepository.create(createAlertDto);
    return await this.alertsRepository.save(alert);
  }

  async findAll(): Promise<Alert[]> {
    return await this.alertsRepository.find();
  }

  async findOne(id: number): Promise<Alert> {
    const alert = await this.alertsRepository.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }
    return alert;
  }
  async findAlertsNearMe(
    latitude: number,
    longitude: number,
  ): Promise<Alert[]> {
    // 1° of latitude ≃ 111.32 km
    const latDelta: number = 5 /* km */ / 111.32;

    // 1° of longitude ≃ 111.32 km × cos φ
    const lngDelta: number =
      5 /* km */ / (111.32 * Math.cos((latitude * Math.PI) / 180));

    const minLat: number = latitude - latDelta;
    const maxLat: number = latitude + latDelta;
    const minLng: number = longitude - lngDelta;
    const maxLng: number = longitude + lngDelta;

    const fifteenMinutesAgo: Date = new Date(Date.now() - 15 * 60 * 1000);

    return this.alertsRepository
      .createQueryBuilder('alert')
      .where(
        `(alert.coordinates->>'latitude')::float BETWEEN :minLat AND :maxLat`,
        { minLat, maxLat },
      )
      .andWhere(
        `(alert.coordinates->>'longitude')::float BETWEEN :minLng AND :maxLng`,
        { minLng, maxLng },
      )
      .andWhere('alert.createdAt >= :date', { date: fifteenMinutesAgo })
      .limit(50)
      .orderBy('alert.createdAt', 'DESC')
      .getMany();
  }

  async update(id: number, updateAlertDto: UpdateAlertDto): Promise<Alert> {
    const alert = await this.findOne(id);
    Object.assign(alert, updateAlertDto);
    return await this.alertsRepository.save(alert);
  }

  async remove(id: number): Promise<void> {
    const alert = await this.findOne(id);
    await this.alertsRepository.remove(alert);
  }
}
