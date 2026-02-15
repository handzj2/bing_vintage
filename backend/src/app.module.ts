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
        
        // 🔒 SAFETY: Only allow sync in local development
        const enableSync = configService.get<string>('SYNCHRONIZE', 'false') === 'true' 
          && nodeEnv === 'development';

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          
          // ✅ FIX: String-based pathing ensures the compiled JS is found in production
          entities: [
            nodeEnv === 'production' 
              ? 'dist/**/*.entity.js' 
              : 'src/**/*.entity.ts'
          ],
          
          // 🛡️ PROTECTION: Enforces your [2026-01-10] policy by locking the schema in prod
          synchronize: enableSync,
          
          // 📊 Connection Pool management
          extra: {
            max: 20,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
          },
          
          // 🔒 SSL required for Railway production
          ssl: nodeEnv === 'production' 
            ? { rejectUnauthorized: false } 
            : false,
            
          logging: nodeEnv === 'development' 
            ? ['error', 'warn', 'schema'] 
            : ['error'],
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