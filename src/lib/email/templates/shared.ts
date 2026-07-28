import { COMPANY } from "@/lib/constants/company";
import { formatCurrency } from "@/lib/datetime";

export interface OrderEmailData {
  orderNo: string;
  tourName: string;
  departureDate: string; // 已格式化字串
  memberCount: number;
  totalDue: number;
  depositRequired: number;
  balanceDue: number;
  contactName: string;
  receiptUrl: string;
}

export function emailLayout(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: 'Microsoft JhengHei', sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
    <h2 style="color: #0f766e;">${title}</h2>
    ${bodyHtml}
    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
    <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
      ${COMPANY.name}<br />
      ${COMPANY.address}<br />
      電話：${COMPANY.phone}　傳真：${COMPANY.fax}<br />
      承辦人：${COMPANY.contactPerson}
    </p>
  </div>`;
}

export function orderSummaryTable(data: OrderEmailData): string {
  return `
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tbody>
      <tr><td style="padding: 4px 0; color: #6b7280;">訂單編號</td><td style="padding: 4px 0; text-align: right;">${data.orderNo}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">團名</td><td style="padding: 4px 0; text-align: right;">${data.tourName}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">出發日期</td><td style="padding: 4px 0; text-align: right;">${data.departureDate}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">報名人數</td><td style="padding: 4px 0; text-align: right;">${data.memberCount} 人</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">應收合計</td><td style="padding: 4px 0; text-align: right;">${formatCurrency(data.totalDue)}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280;">已收訂金</td><td style="padding: 4px 0; text-align: right;">${formatCurrency(data.depositRequired)}</td></tr>
      <tr><td style="padding: 4px 0; color: #6b7280; font-weight: bold;">尚欠尾款</td><td style="padding: 4px 0; text-align: right; font-weight: bold;">${formatCurrency(data.balanceDue)}</td></tr>
    </tbody>
  </table>`;
}
