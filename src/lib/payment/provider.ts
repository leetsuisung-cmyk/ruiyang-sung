import { trustPayProvider } from "./trustpay";
import type { PaymentProvider } from "./types";

export function isPaymentTestMode(): boolean {
  return process.env.PAYMENT_TEST_MODE === "true";
}

export function getPaymentProvider(): PaymentProvider {
  return trustPayProvider;
}

export type { PaymentProvider } from "./types";
