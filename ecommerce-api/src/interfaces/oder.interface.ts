export interface VendorGroupItem {
  product_id: string;
  quantity: number;
  price: number;
  vendor_id: string;
  vendor_name: string;
}

export interface VendorGroup {
  vendorId: string;
  vendorName: string;
  items: VendorGroupItem[];
  deliveryFee: number;
}