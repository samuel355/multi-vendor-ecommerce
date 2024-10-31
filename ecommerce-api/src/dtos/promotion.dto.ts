import { 
  IsString, 
  IsEnum, 
  IsNumber, 
  IsDate, 
  IsOptional, 
  IsUUID, 
  IsArray, 
  Min, 
  Max, 
  IsBoolean 
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

export enum PromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export class CreatePromotionDTO {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountValue: number;

  @IsDate()
  startDate: Date;

  @IsDate()
  endDate: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPurchase?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  productIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdatePromotionDTO {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountValue?: number;

  @IsOptional()
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPurchase?: number;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  productIds?: string[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}