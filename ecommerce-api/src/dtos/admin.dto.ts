import { 
  IsString, 
  IsEnum, 
  IsBoolean, 
  IsOptional, 
  IsUUID, 
  IsNumber, 
  IsArray,
  IsEmail,
  MinLength 
} from 'class-validator';

export enum VendorStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}

export enum AdminAction {
  APPROVE = 'approve',
  REJECT = 'reject',
  SUSPEND = 'suspend',
  REINSTATE = 'reinstate',
  BAN = 'ban'
}

export class UpdateVendorStatusDTO {
  @IsEnum(VendorStatus)
  status: VendorStatus;

  @IsString()
  @MinLength(10)
  reason: string;

  @IsOptional()
  @IsString()
  duration?: string; // For temporary suspensions
}

export class AdminVendorFilterDTO {
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  hasActiveSubscription?: boolean;
}

export class UpdateCommissionRateDTO {
  @IsNumber()
  commissionRate: number;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class CreateAnnouncementDTO {
  @IsString()
  @MinLength(10)
  title: string;

  @IsString()
  @MinLength(20)
  message: string;

  @IsArray()
  @IsUUID('4', { each: true })
  targetVendors: string[];

  @IsOptional()
  @IsString()
  validUntil?: string;
}

export class VendorVerificationDTO {
  @IsBoolean()
  isVerified: boolean;

  @IsArray()
  @IsString({ each: true })
  verifiedDocuments: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}