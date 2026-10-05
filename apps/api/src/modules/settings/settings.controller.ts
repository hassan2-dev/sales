import { Body, Controller, Get, Patch } from '@nestjs/common';
import { SettingsService } from './settings.service.js';
import { UpdateSiteSettingsDto } from './dto/settings.dto.js';
import {
  Public,
  RequirePermissions,
} from '../../common/decorators/auth.decorators.js';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Public()
  @Get('commerce')
  getPublic() {
    return this.settingsService.getPublic();
  }

  @RequirePermissions('settings:update')
  @Get('commerce/admin')
  getAdmin() {
    return this.settingsService.getAdmin();
  }

  @RequirePermissions('settings:update')
  @Patch('commerce')
  update(@Body() dto: UpdateSiteSettingsDto) {
    return this.settingsService.update(dto);
  }
}
