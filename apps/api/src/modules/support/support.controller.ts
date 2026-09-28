import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SupportService } from './support.service.js';
import {
  AssignTicketDto,
  ChangePriorityDto,
  ChangeStatusDto,
  CreateMessageDto,
  CreateTicketDto,
  TicketQueryDto,
  UpdateTicketDto,
} from './dto/support.dto.js';
import { RequirePermissions } from '../../common/decorators/auth.decorators.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/types/jwt-payload.type.js';

@ApiTags('support')
@ApiBearerAuth()
@Controller('tickets')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @RequirePermissions('support:create')
  @Post()
  create(@Body() dto: CreateTicketDto) {
    return this.supportService.create(dto);
  }

  @RequirePermissions('support:read')
  @Get()
  findAll(@Query() query: TicketQueryDto) {
    return this.supportService.findAll(query);
  }

  @RequirePermissions('support:read')
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.findOne(id);
  }

  @RequirePermissions('support:update')
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.supportService.update(id, dto);
  }

  @RequirePermissions('support:update')
  @Patch(':id/assign')
  assign(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignTicketDto,
  ) {
    return this.supportService.assign(id, dto.assignedToId);
  }

  @RequirePermissions('support:update')
  @Patch(':id/priority')
  changePriority(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangePriorityDto,
  ) {
    return this.supportService.changePriority(id, dto.priority);
  }

  @RequirePermissions('support:update')
  @Patch(':id/status')
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.supportService.changeStatus(id, dto.status);
  }

  @RequirePermissions('support:reply')
  @Post(':id/messages')
  addMessage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.supportService.addMessage(id, user.id, dto);
  }

  @RequirePermissions('support:delete')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.supportService.remove(id);
  }
}
