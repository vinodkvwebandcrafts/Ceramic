export interface RazorpayOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number; // paise
  currency: string;
  keyId: string;
}

export interface RazorpayVerifyInput {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  orderNumber: string;
  paymentId: string | null;
}
