import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CartService } from './cart.service.js';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart.dto.js';
import { Public } from '../../common/decorators/auth.decorators.js';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Public()
  @Get()
  getCart(@Headers('x-session-id') sessionId: string) {
    return this.cartService.getCart(sessionId);
  }

  @Public()
  @Post('items')
  addItem(
    @Headers('x-session-id') sessionId: string,
    @Body() dto: AddCartItemDto,
  ) {
    return this.cartService.addItem(sessionId, dto);
  }

  @Public()
  @Patch('items/:itemId')
  updateItem(
    @Headers('x-session-id') sessionId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(sessionId, itemId, dto);
  }

  @Public()
  @Delete('items/:itemId')
  removeItem(
    @Headers('x-session-id') sessionId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(sessionId, itemId);
  }

  @Public()
  @Delete()
  clear(@Headers('x-session-id') sessionId: string) {
    return this.cartService.clearCart(sessionId);
  }
}
