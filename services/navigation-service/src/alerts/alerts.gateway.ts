import { Controller, NotFoundException } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Controller()
export class AlertsGateway {
  constructor(private readonly alertsService: AlertsService) {}

  @MessagePattern('createAlert')
  create(@Payload() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @MessagePattern('findAllAlerts')
  async findAllAlerts() {
    return this.alertsService.findAll();
  }

  @MessagePattern('findOneAlert')
  findOne(@Payload() id: number) {
    return this.alertsService.findOne(id);
  }

  @MessagePattern('findAlertsNearMe')
  async findAlertsNearMe(
    @Payload() data: { latitude: number; longitude: number },
  ) {
    try {
      return await this.alertsService.findAlertsNearMe(
        data.latitude,
        data.longitude,
      );
    } catch {
      return [];
    }
  }

  @MessagePattern('updateAlert')
  update(@Payload() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(updateAlertDto.id, updateAlertDto);
  }

  @MessagePattern('removeAlert')
  async removeAlert(@Payload() id: number) {
    const alert = await this.alertsService.findOne(id);
    if (!alert) {
      throw new NotFoundException(`Alert with ID ${id} not found`);
    }
    await this.alertsService.remove(id);
    return { id: alert.id, deleted: true };
  }
}
