import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module.js';
import { BrandsModule } from '../brands/brands.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { OfficesModule } from '../offices/offices.module.js';
import { McpController } from './mcp.controller.js';
import { McpService } from './mcp.service.js';

@Module({
  imports: [ServicesModule, BrandsModule, ProjectsModule, OfficesModule],
  controllers: [McpController],
  providers: [McpService],
})
export class McpModule {}
