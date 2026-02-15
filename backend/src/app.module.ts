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
        
        // ✅ FIX: Check multiple possible env var names
        const nodeEnv = configService.get<string>('NODE_ENV') 
          || process.env.NODE_ENV 
          || 'development';
        
        // Railway sets NODE_ENV=production automatically
        const isProduction = nodeEnv === 'production';

        console.log(`🔧 Environment: ${nodeEnv}`);
        console.log(`📦 Production mode: ${isProduction}`);

        return {
          type: 'postgres',
          url: databaseUrl,
          
          // ✅ FIX: Use autoLoadEntities (recommended) OR explicit JS path
          // autoLoadEntities: true loads from imported modules, not filesystem
          autoLoadEntities: true,
          
          // ✅ FIX: Only use glob if autoLoadEntities fails
          // In production, ONLY look for .js files in dist/
          entities: isProduction 
            ? [__dirname + '/../**/*.entity.js']  // Compiled JS only
            : [__dirname + '/../**/*.entity.ts'], // TS in dev
          
          // 🛡️ NEVER synchronize in production
          synchronize: !isProduction && configService.get('SYNCHRONIZE') === 'true',
          
          extra: {
            max: 20,
            connectionTimeoutMillis: 10000,
            idleTimeoutMillis: 30000,
          },
          
          ssl: isProduction 
            ? { rejectUnauthorized: false } 
            : false,
            
          logging: isProduction ? ['error'] : ['error', 'warn'],
        };
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
})
export class AppModule {}