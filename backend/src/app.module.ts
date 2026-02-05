// FIXED: src/app.module.ts
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
        
        // Parse Railway DATABASE_URL
        if (databaseUrl) {
          const url = new URL(databaseUrl);
          const dbName = url.pathname.replace('/', ''); // Remove leading slash
          
          const config: any = {
            type: 'postgres',
            host: url.hostname,
            port: parseInt(url.port || '5432'),
            username: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: dbName,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
            ssl: { rejectUnauthorized: false },
            extra: {
              max: 20,
              connectionTimeoutMillis: 10000,
            },
          };
          return config;
        }
        
        // Fallback to individual PG* variables
        const pgHost = configService.get<string>('PGHOST');
        if (pgHost) {
          const config: any = {
            type: 'postgres',
            host: pgHost,
            port: parseInt(configService.get('PGPORT', '5432')),
            username: configService.get('PGUSER', 'postgres'),
            password: configService.get('PGPASSWORD', ''),
            database: configService.get('PGDATABASE', 'railway'),
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: false,
            ssl: { rejectUnauthorized: false },
            extra: {
              max: 20,
              connectionTimeoutMillis: 10000,
            },
          };
          return config;
        }
        
        // Local development
        const config: any = {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', '@1'),
          database: configService.get('DB_NAME', 'bikesure_db'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: true,
        };
        return config;
      },
    }),
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
  controllers: [],
  providers: [],
})
export class AppModule {}