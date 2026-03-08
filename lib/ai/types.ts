export type ExtractedPurchaseItem = {
  product_name: string;
  quantity: number;
  unit_price: number;
  return_window_days: number | null;
  warranty_months: number | null;
};

export type ExtractedPurchase = {
  merchant_name: string;
  order_number: string;
  order_date: string | null;
  delivery_date: string | null;
  currency: string;
  total_amount: number;
  support_email: string | null;
  items: ExtractedPurchaseItem[];
  confidence: number;
};
