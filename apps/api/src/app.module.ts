import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { StoresModule } from './modules/stores/stores.module';
import { ProductsModule } from './modules/products/products.module';
import { SellpagesModule } from './modules/sellpages/sellpages.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LegalModule } from './modules/legal/legal.module';
import { SettingsModule } from './modules/settings/settings.module';
import { PublicModule } from './modules/public/public.module';
import { HealthModule } from './modules/health/health.module';
import { DomainsModule } from './modules/domains/domains.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { EmailModule } from './modules/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    StoresModule,
    ProductsModule,
    SellpagesModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    PaymentsModule,
    LegalModule,
    SettingsModule,
    DomainsModule,
    ReviewsModule,
    EmailModule,
    PublicModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
