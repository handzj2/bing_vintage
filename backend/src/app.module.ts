// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuthModule } from './modules/auth/auth.module';
import { ClientsModule } from './modules/clients/clients.module';
import { LoansModule } from './modules/loans/loans.module';
import { BikesModule } from './modules/bikes/bikes.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';
import { AuditModule } from './modules/audit/audit.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { ReceiptsModule } from './modules/receipts/receipts.module';
import { SyncModule } from './modules/sync/sync.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const nodeEnv = configService.get<string>('NODE_ENV', 'development');

        return {
          type: 'postgres',
          // 🔗 Uses the full Railway connection string automatically
          url: databaseUrl, 
          autoLoadEntities: true,
          // 📂 Points to compiled JS in dist for production and TS in src for local
          entities: [__dirname + '/**/*.entity{.ts,.js}'], 

          // 🛡️ SECURITY: synchronize is FALSE in production to prevent data loss.
          // This supports your [2026-01-10] policy of no-deletion/reversal.
          synchronize: nodeEnv !== 'production',

          // 🔒 Required for Railway Postgres production
          ssl: nodeEnv === false, ? { rejectUnauthorized: false } : false,

          extra: {
            max: 20,
            connectionTimeoutMillis: 10000,
          },
        };
      },
    }),
    // Business Logic Modules
    AuthModule,
    ClientsModule,
    LoansModule,
    PaymentsModule,
    BikesModule,
    ReportsModule,
    SettingsModule,
    UsersModule,
    AuditModule,
    SchedulesModule,
    ReceiptsModule,
    SyncModule,
  ],
})
export class AppModule {}