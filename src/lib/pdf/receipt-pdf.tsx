import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/datetime";
import { COMPANY } from "@/lib/constants/company";
import { pdfStyles } from "./styles";

// 版面依公司既有的紙本「請款單」格式製作（收款明細/請款單.docx）
// 注意: PDF 中文字型子集僅含半形標點，文案一律使用半形標點符號

export interface ReceiptPdfData {
  orderNo: string;
  tourName: string;
  tourCode: string | null;
  departureCountry: string;
  departureDate: Date;
  days: number;
  memberCount: number;
  pricePerPerson: number;
  subtotal: number;
  totalDiscount: number;
  totalDue: number;
  depositRequired: number;
  balanceDue: number;
  chargeType: "DEPOSIT" | "BALANCE";
  contactName: string;
  contactPhone: string;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  createdAt: Date;
}

function DoubleLine() {
  return (
    <View
      style={{
        borderTop: "1px solid #111827",
        borderBottom: "1px solid #111827",
        height: 3,
        marginVertical: 6,
      }}
    />
  );
}

function DashedLine() {
  return <View style={{ borderTop: "1px dashed #6b7280", marginVertical: 6 }} />;
}

export function ReceiptPdfDocument({ data }: { data: ReceiptPdfData }) {
  const isBalanceCharge = data.chargeType === "BALANCE";
  // 每人訂金/每人尾款: 以合計金額除以人數回推，兼容舊訂單的整團固定訂金設定
  const depositPerPerson = Math.round(data.depositRequired / data.memberCount);
  const balancePerPerson = Math.round(data.balanceDue / data.memberCount);
  // 此次消費: 依團體設定，本次向客人收訂金合計或尾款合計
  const chargeNow = isBalanceCharge ? data.balanceDue : data.depositRequired;

  return (
    <Document>
      <Page size="A4" style={[pdfStyles.page, { fontSize: 10.5, paddingTop: 40 }]}>
        {/* 公司抬頭 */}
        <View style={{ textAlign: "center", marginBottom: 4 }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 3 }}>{COMPANY.name}</Text>
          <Text style={{ fontSize: 9.5, color: "#374151", marginBottom: 1 }}>{COMPANY.address}</Text>
          <Text style={{ fontSize: 9.5, color: "#374151" }}>
            TEL:{COMPANY.phone}  FAX:{COMPANY.fax}
          </Text>
        </View>

        <Text
          style={{
            fontSize: 15,
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: 6,
            marginVertical: 6,
          }}
        >
          請 款 單
        </Text>

        <DoubleLine />

        {/* 聯絡人列 */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
          <Text>報名聯絡人: {data.contactName}</Text>
          <Text>連絡電話: {data.contactPhone}</Text>
          <Text>日期: {formatDate(data.createdAt)}</Text>
        </View>
        <Text style={{ fontSize: 8.5, color: "#6b7280", marginBottom: 2 }}>
          訂單編號 NO: {data.orderNo}
        </Text>

        <DoubleLine />

        {/* 團號 / 摘要 / 數量 表格 */}
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1.2, textAlign: "center" }]}>團 號</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 3, textAlign: "center" }]}>摘 要</Text>
            <Text style={[pdfStyles.tableHeaderCell, { flex: 1, textAlign: "center" }]}>數 量</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={[pdfStyles.tableCell, { flex: 1.2, textAlign: "center" }]}>
              {data.tourCode ?? "-"}
            </Text>
            <Text style={[pdfStyles.tableCell, { flex: 3 }]}>
              {data.tourName} ({data.departureCountry})  每人團費 {formatCurrency(data.pricePerPerson)}
            </Text>
            <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "center" }]}>
              {data.memberCount} 人
            </Text>
          </View>
        </View>

        {/* 出發日期 / 團費明細（自動計算式） */}
        <View style={{ marginTop: 8, gap: 3 }}>
          <Text>
            出發日期: {formatDate(data.departureDate)} ({data.days} 天)
          </Text>
          <Text style={{ fontWeight: "bold" }}>團費明細:</Text>
          <Text>
            每人團費 {formatCurrency(data.pricePerPerson)} x {data.memberCount} 人 ={" "}
            {formatCurrency(data.subtotal)}
          </Text>
          {data.totalDiscount > 0 && <Text>優惠金額: -{formatCurrency(data.totalDiscount)}</Text>}
          <Text>團費合計: {formatCurrency(data.totalDue)}</Text>
          <Text>
            訂金合計: {formatCurrency(depositPerPerson)} x {data.memberCount} 人 ={" "}
            {formatCurrency(data.depositRequired)}
          </Text>
          <Text>
            每人尾款: {formatCurrency(balancePerPerson)} (每人團費 - 優惠 - 每人訂金)
          </Text>
          <Text>
            尾款合計: {formatCurrency(balancePerPerson)} x {data.memberCount} 人 ={" "}
            {formatCurrency(data.balanceDue)}
          </Text>
          <Text>
            付款方式: {data.paymentMethodLabel}  付款狀態: {data.paymentStatusLabel}
          </Text>
        </View>

        {/* 注意事項（依紙本請款單文案） */}
        <View style={{ marginTop: 10, gap: 3 }}>
          <Text>*請提供護照, 姓名聯絡電話, 有效期護照, 方便作業, 感謝配合!</Text>
          <Text>付款D/L: 年 月 日 PM12: 前入帳, 才可優先保留名額, 匯入請告知後5碼, 謝謝</Text>
          <Text>
            銀行: {COMPANY.bank.bankName} {COMPANY.bank.branchName}  戶名: {COMPANY.bank.accountName}
            {"  "}帳號: {COMPANY.bank.accountNumber}
          </Text>
        </View>

        <DashedLine />

        <Text style={{ textAlign: "right", fontSize: 9.5, color: "#374151" }}>
          此次消費: {isBalanceCharge ? "尾款" : "訂金"}
        </Text>
        <Text style={{ textAlign: "right", fontSize: 12, fontWeight: "bold", marginVertical: 4 }}>
          應收合計: {formatCurrency(chargeNow)} 元
        </Text>

        <DoubleLine />

        {/* 簽核列 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 10,
          }}
        >
          <Text>主管:</Text>
          <Text>會計:</Text>
          <Text>承辦人: {COMPANY.contactPerson}</Text>
        </View>

        <Text style={pdfStyles.footer}>本請款單由系統自動產生, 如有疑問請洽承辦人</Text>
      </Page>
    </Document>
  );
}
