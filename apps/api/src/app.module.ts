import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from './common/guards/permissions.guard.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { RolesModule } from './modules/roles/roles.module.js';
import { ProductsModule } from './modules/products/products.module.js';
import { CategoriesModule } from './modules/categories/categories.module.js';
import { BrandsModule } from './modules/brands/brands.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { MediaModule } from './modules/media/media.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { CustomersModule } from './modules/customers/customers.module.js';
import { QuotesModule } from './modules/quotes/quotes.module.js';
import { SupportModule } from './modules/support/support.module.js';
import { PagesModule } from './modules/pages/pages.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { NewsModule } from './modules/news/news.module.js';
import { OfficesModule } from './modules/offices/offices.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { SettingsModule } from './modules/settings/settings.module.js';
import { AnalyticsModule } from './modules/analytics/analytics.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    PrismaModule,
    StorageModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    InventoryModule,
    MediaModule,
    CartModule,
    OrdersModule,
    CustomersModule,
    QuotesModule,
    SupportModule,
    PagesModule,
    ServicesModule,
    ProjectsModule,
    NewsModule,
    OfficesModule,
    NotificationsModule,
    AuditModule,
    DashboardModule,
    SettingsModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
