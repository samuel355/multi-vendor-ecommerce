import { IsEnum, IsUUID, IsOptional, IsDateString } from 'class-validator';

export enum TimeFrame {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export class AnalyticsQueryDTO {
  @IsEnum(TimeFrame)
  timeframe: TimeFrame = TimeFrame.DAILY;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ProductAnalyticsDTO {
  @IsUUID()
  productId: string;

  @IsEnum(TimeFrame)
  timeframe: TimeFrame = TimeFrame.DAILY;
}