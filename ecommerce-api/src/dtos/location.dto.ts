import { IsString, IsNotEmpty, Matches, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateLocationDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{2}-\d{3,4}-\d{4}$/, {
    message: 'Invalid Ghana GPS digital address format. Expected format: XX-XXXX-XXXX (e.g., GA-123-4567)'
  })
  digitalAddress: string;

  @IsOptional()
  @IsString()
  streetAddress?: string;

  @IsOptional()
  @IsString()
  landmark?: string;
}

export class NearbyVendorsDTO {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50) // Maximum 50km radius
  radius?: number = 5; // Default 5km
}

export class RegionDTO {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(Greater Accra|Ashanti|Central|Eastern|Northern|Western|Volta|Brong Ahafo|Upper East|Upper West)$/, {
    message: 'Invalid region name'
  })
  region: string;
}