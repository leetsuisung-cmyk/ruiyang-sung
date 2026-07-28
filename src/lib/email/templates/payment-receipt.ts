import { emailLayout, orderSummaryTable, type OrderEmailData } from "./shared";

export function paymentReceiptEmail(
  data: OrderEmailData,
  statusLabel: string
): { subject: string; html: string } {
  const subject = `【睿煬旅行社】正式收據 - ${data.tourName}（訂單編號 ${data.orderNo}）`;
  const html = emailLayout(
    "付款確認收據",
    `
    <p>${data.contactName} 您好，我們已確認收到您的款項，目前訂單狀態為「<strong>${statusLabel}</strong>」，明細如下：</p>
    ${orderSummaryTable(data)}
    <p>
      <a href="${data.receiptUrl}" style="display: inline-block; padding: 10px 20px; background: #0f766e; color: #fff; text-decoration: none; border-radius: 6px;">
        查看線上收據
      </a>
    </p>
  `
  );
  return { subject, html };
}
