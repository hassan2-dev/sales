import { Module } from '@nestjs/common';
import { StaffRolesService } from './staff-roles.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, StaffRolesService],
  exports: [UsersService],
})
export class UsersModule {}
