import { emailLayout, orderSummaryTable, type OrderEmailData } from "./shared";

export function orderConfirmationEmail(data: OrderEmailData): { subject: string; html: string } {
  const subject = `【睿煬旅行社】報名確認 - ${data.tourName}（訂單編號 ${data.orderNo}）`;
  const html = emailLayout(
    "報名確認通知",
    `
    <p>${data.contactName} 您好，感謝您報名「${data.tourName}」，我們已收到您的報名資料，明細如下：</p>
    ${orderSummaryTable(data)}
    <p>
      <a href="${data.receiptUrl}" style="display: inline-block; padding: 10px 20px; background: #0f766e; color: #fff; text-decoration: none; border-radius: 6px;">
        查看線上收據
      </a>
    </p>
    <p style="color: #6b7280; font-size: 14px;">若您選擇銀行匯款繳訂金，我們將於確認收到款項後與您聯繫並更新付款狀態。</p>
  `
  );
  return { subject, html };
}
