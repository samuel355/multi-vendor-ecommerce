import { 
  IsString, 
  IsUUID, 
  IsNumber, 
  IsOptional, 
  IsEnum, 
  IsArray, 
  ValidateNested, 
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

class DeliveryAddressDTO {
  @IsString()
  @MinLength(5)
  streetAddress: string;

  @IsString()
  city: string;

  @IsString()
  region: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  digitalAddress: string;

  @IsOptional()
  @IsString()
  landmark?: string;

  @IsOptional()
  @IsString()
  additionalDirections?: string;
}

class OrderItemDTO {
  @IsUUID()
  productId: string;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDTO {
  @IsUUID()
  cartId: string;

  @ValidateNested()
  @Type(() => DeliveryAddressDTO)
  deliveryAddress: DeliveryAddressDTO;

  @IsPhoneNumber('GH')
  contactPhone: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;

  @IsOptional()
  @IsString()
  preferredDeliveryTime?: string;
}

export class UpdateOrderStatusDTO {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  estimatedDeliveryDate?: string;
}

export class OrderFilterDTO {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  maxAmount?: number;
}

export class BulkUpdateOrdersDTO {
  @IsArray()
  @IsUUID('4', { each: true })
  orderIds: string[];

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CancelOrderDTO {
  @IsEnum(['customer_request', 'out_of_stock', 'delivery_issues', 'other'])
  reason: string;

  @IsOptional()
  @IsString()
  additionalNotes?: string;
}

export class OrderRefundDTO {
  @IsNumber()
  amount: number;

  @IsEnum(['full', 'partial'])
  type: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class OrderDeliveryUpdateDTO {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  deliveryPersonName?: string;

  @IsOptional()
  @IsPhoneNumber('GH')
  deliveryPersonPhone?: string;

  @IsOptional()
  @IsString()
  estimatedDeliveryTime?: string;
}

export class DisputeOrderDTO {
  @IsString()
  @MinLength(10)
  reason: string;

  @IsEnum(['quality_issues', 'wrong_item', 'damaged', 'incomplete', 'other'])
  type: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  preferredResolution?: string;
}

export class RateDeliveryDTO {
  @IsNumber()
  rating: number;

  @IsOptional()
  @IsString()
  review?: string;

  @IsBoolean()
  onTime: boolean;

  @IsBoolean()
  properPackaging: boolean;

  @IsOptional()
  @IsString()
  feedbackNotes?: string;
}

export class AddDeliveryAddressDTO {
  @ValidateNested()
  @Type(() => DeliveryAddressDTO)
  address: DeliveryAddressDTO;

  @IsString()
  label: string; // e.g., 'home', 'work', 'other'

  @IsBoolean()
  isDefault: boolean;
}

// For vendors to set their delivery preferences
export class VendorDeliverySettingsDTO {
  @IsArray()
  @IsString({ each: true })
  serviceAreas: string[];

  @IsNumber()
  baseDeliveryFee: number;

  @IsNumber()
  freeDeliveryThreshold: number;

  @IsOptional()
  @IsNumber()
  additionalKmFee?: number;

  @IsOptional()
  @IsNumber()
  maxDeliveryDistance?: number;

  @IsBoolean()
  providesOwnDelivery: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedAreas?: string[];
}