import { IsEnum, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export enum BillingCycle{
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export class CreateSubscriptionDTO{
  @IsUUID()
  planId: string
  
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
  
  @IsOptional()
  @IsString()
  callbackUrl?:string
}

export class UpdateSubscriptionDTO {
  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;
}

export class SubscriptionPlanDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  priceMonthly: number;

  @IsNumber()
  priceYearly: number;

  @IsOptional()
  @IsNumber()
  productLimit?: number;

  @IsOptional()
  features?: any;
}