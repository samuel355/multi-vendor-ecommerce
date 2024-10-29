import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  Length,
} from "class-validator";

export class CreateVendorDTO{
  @IsString()
  @Length(3, 50)
  businessName: string;
  
  @IsString()
  @Length(10, 50)
  description: string;
  
  @IsEmail()
  contactEmail: string;
  
  @IsString()
  @Length(10, 15)
  phone: string;
  
  @IsString()
  @Length(3, 200)
  address: string;
  
  @IsString()
  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateVendorDTO{
  @IsOptional()
  @IsString()
  @Length(3, 50)
  businessName?: string;

  @IsOptional()
  @IsString()
  @Length(10, 500)
  description?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @Length(10, 15)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(5, 200)
  address?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}