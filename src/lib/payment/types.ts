export interface CreateCheckoutParams {
  orderId: string;
  orderNo: string;
  amount: number;
}

export interface CreateCheckoutResult {
  checkoutUrl: string;
  checkToken: string;
}

export interface CallbackVerificationResult {
  success: boolean;
  orderId: string;
  providerRef: string;
  rawPayload: string;
}

export interface PaymentProvider {
  createCheckoutUrl(params: CreateCheckoutParams): Promise<CreateCheckoutResult>;
  verifyCallback(payload: Record<string, unknown>): Promise<CallbackVerificationResult>;
}
