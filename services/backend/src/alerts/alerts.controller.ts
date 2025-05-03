import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './../auth/jwt/jwt.guard';
import { Claims } from './../auth/rbac/claims.decorator';
import { Claim } from './../auth/rbac/claims.enum';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { lastValueFrom } from 'rxjs';
import { Alert } from './entities/alert.entity';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Claims(Claim.WRITE_OWN_ALERT)
  @ApiOperation({ summary: 'Create a new alert' })
  @ApiResponse({
    status: 201,
    description: 'The alert has been successfully created.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createAlertDto: CreateAlertDto) {
    return this.alertsService.create(createAlertDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all alerts' })
  @ApiResponse({
    status: 200,
    description: 'Returns all alerts.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    console.log('findAll');
    return this.alertsService.findAll();
  }

  @Get('near-me')
  @ApiOperation({ summary: 'Get alerts near me' })
  @ApiResponse({
    status: 200,
    description: 'Returns all alerts near the user.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAlertsNearMe(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<Alert[]> {
    const result = (await lastValueFrom(
      this.alertsService.findAlertsNearMe(latitude, longitude),
    )) as Alert[];
    return Array.isArray(result) ? result : [result];
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get an alert by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the alert with the specified ID.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  findOne(@Param('id') id: string) {
    return this.alertsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Claims(Claim.WRITE_OWN_ALERT)
  @ApiOperation({ summary: 'Update an alert by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the updated alert.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  update(@Param('id') id: string, @Body() updateAlertDto: UpdateAlertDto) {
    return this.alertsService.update(+id, updateAlertDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Claims(Claim.WRITE_OWN_ALERT)
  @ApiOperation({ summary: 'Delete an alert by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the deleted alert.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Alert not found' })
  remove(@Param('id') id: string) {
    return this.alertsService.remove(+id);
  }
}
