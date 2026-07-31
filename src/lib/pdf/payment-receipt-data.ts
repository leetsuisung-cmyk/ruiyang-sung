import type { Order, PaymentTransaction, Tour } from "@prisma/client";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";
import type { PaymentReceiptPdfData } from "./payment-receipt-pdf";

type OrderForReceipt = Order & { tour: Tour; paymentTransactions: PaymentTransaction[] };

/** 客人端與後台共用同一份收據資料，確保兩邊開出來的收據完全一致 */
export function buildPaymentReceiptData(order: OrderForReceipt): PaymentReceiptPdfData {
  // 此次消費收尾款時金額為尾款合計，否則為訂金合計
  const paidAmount =
    order.chargeTypeSnapshot === "BALANCE" ? order.balanceDue : order.depositRequired;

  const successTransaction = order.paymentTransactions.find((t) => t.status === "SUCCESS");

  return {
    orderNo: order.orderNo,
    tourName: order.tour.name,
    tourCode: order.tourCode ?? order.tour.tourCode,
    departureCountry: order.departureCountry ?? order.tour.departureCountry ?? "",
    departureDate: order.departureDate ?? order.tour.departureDate,
    days: order.days ?? order.tour.days ?? 0,
    memberCount: order.memberCount,
    totalDue: order.totalDue,
    paidAmount,
    chargeType: order.chargeTypeSnapshot,
    contactName: order.contactName,
    paymentMethodLabel: PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus,
    bankTransferLast5: order.bankTransferLast5,
    paidAt: successTransaction?.createdAt ?? order.updatedAt,
  };
}
