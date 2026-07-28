import { prisma } from "@/lib/prisma";
import { createOrderAccessToken } from "@/lib/auth/order-access";
import { sendMail } from "@/lib/email/mailer";
import { paymentReceiptEmail } from "@/lib/email/templates/payment-receipt";
import { formatDate } from "@/lib/datetime";
import { PAYMENT_STATUS_LABELS } from "@/lib/labels";

/**
 * 寄出正式收據 email。預設若該訂單已寄過就略過（避免重複騷擾客戶），
 * 後台手動重寄（force: true）則忽略此限制。
 */
export async function sendPaymentReceiptEmailIfNeeded(
  orderId: string,
  options: { force?: boolean } = {}
): Promise<void> {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { tour: true } });
  if (!order) return;
  if (order.receiptEmailSentAt && !options.force) return;

  const accessToken = await createOrderAccessToken(order.id);
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";

  const { subject, html } = paymentReceiptEmail(
    {
      orderNo: order.orderNo,
      tourName: order.tour.name,
      departureDate: formatDate(order.tour.departureDate),
      memberCount: order.memberCount,
      totalDue: order.totalDue,
      depositRequired: order.depositRequired,
      balanceDue: order.balanceDue,
      contactName: order.contactName,
      receiptUrl: `${baseUrl}/tour/${order.tourId}/success/${order.id}?t=${accessToken}`,
    },
    PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus
  );

  const notifyEmail = process.env.NOTIFY_EMAIL;
  const recipients = notifyEmail ? [order.contactEmail, notifyEmail] : [order.contactEmail];
  const mailResult = await sendMail({ to: recipients, subject, html });

  if (mailResult.ok) {
    await prisma.order.update({ where: { id: order.id }, data: { receiptEmailSentAt: new Date() } });
  }
}
