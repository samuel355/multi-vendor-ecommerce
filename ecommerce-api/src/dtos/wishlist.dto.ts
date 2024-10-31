import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class AddToWishlistDTO {
  @IsUUID()
  productId: string;
}

export class WishlistQueryDTO {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}