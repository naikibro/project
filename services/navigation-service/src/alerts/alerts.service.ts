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
    return this.alertsRepository
      .createQueryBuilder('alert')
      .where(`alert.coordinates->>'latitude' BETWEEN :minLat AND :maxLat`, {
        minLat: latitude - 1.1,
        maxLat: latitude + 1.1,
      })
      .andWhere(`alert.coordinates->>'longitude' BETWEEN :minLng AND :maxLng`, {
        minLng: longitude - 1.1,
        maxLng: longitude + 1.1,
      })
      .limit(50)
      .orderBy('alert.date', 'DESC')
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
