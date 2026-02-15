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
        
        // 🔒 SAFETY: Never auto-synchronize in production or staging
        // Set SYNCHRONIZE=true in .env ONLY for local development resets
        const enableSync = configService.get<string>('SYNCHRONIZE', 'false') === 'true' 
          && nodeEnv === 'development';

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          
          // 🛡️ PROTECTION: Explicit opt-in required even for dev
          synchronize: enableSync,
          
          // 📊 Prevents connection pool exhaustion
          extra: {
            max: 20,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
          },
          
          // 🔒 SSL for production only
          ssl: nodeEnv === 'production' 
            ? { rejectUnauthorized: false } 
            : false,
            
          // 📝 Logging control
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