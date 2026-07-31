import path from "path";
import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/datetime";
import { COMPANY } from "@/lib/constants/company";
import { pdfStyles } from "./styles";

// 客人付款完成後開立的正式收據（蓋公司章）
// 注意: PDF 中文字型子集僅含半形標點，文案一律使用半形標點符號

export interface PaymentReceiptPdfData {
  orderNo: string;
  tourName: string;
  tourCode: string | null;
  departureCountry: string;
  departureDate: Date;
  days: number;
  memberCount: number;
  totalDue: number;
  paidAmount: number;
  chargeType: "DEPOSIT" | "BALANCE";
  contactName: string;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  bankTransferLast5: string | null;
  paidAt: Date;
}

const SEAL_PATH = path.join(process.cwd(), "src/lib/pdf/assets/company-seal.png");

const DIGITS = ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];
const UNITS = ["", "拾", "佰", "仟"];
const SECTIONS = ["", "萬", "億"];

/** 金額轉國字大寫，例如 60000 -> 陸萬圓整 */
function amountInChinese(amount: number): string {
  if (amount <= 0) return "零圓整";

  const sections: string[] = [];
  let rest = Math.floor(amount);
  let sectionIndex = 0;

  while (rest > 0) {
    const group = rest % 10000;
    rest = Math.floor(rest / 10000);

    let groupText = "";
    let zeroPending = false;
    for (let i = 0; group > 0 && i < 4; i++) {
      const digit = Math.floor(group / Math.pow(10, i)) % 10;
      if (digit === 0) {
        zeroPending = groupText !== "";
      } else {
        groupText = DIGITS[digit] + UNITS[i] + (zeroPending ? "零" : "") + groupText;
        zeroPending = false;
      }
    }

    if (groupText) {
      sections.unshift(groupText + SECTIONS[sectionIndex]);
    } else if (sections.length > 0) {
      sections.unshift("零");
    }
    sectionIndex++;
  }

  return sections.join("").replace(/零+/g, "零").replace(/零$/, "") + "圓整";
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

export function PaymentReceiptPdfDocument({ data }: { data: PaymentReceiptPdfData }) {
  const chargeWord = data.chargeType === "BALANCE" ? "尾款" : "訂金";

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
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            letterSpacing: 8,
            marginVertical: 8,
          }}
        >
          收 據
        </Text>

        <DoubleLine />

        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
          <Text>收據編號: {data.orderNo}</Text>
          <Text>開立日期: {formatDate(data.paidAt)}</Text>
        </View>

        <DoubleLine />

        {/* 茲收到 */}
        <View style={{ marginTop: 6, marginBottom: 8 }}>
          <Text style={{ fontSize: 12 }}>
            茲收到 {data.contactName} 君 繳交下列款項, 特此立據
          </Text>
        </View>

        {/* 團號 / 摘要 / 數量 */}
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
              {data.tourName}
              {data.departureCountry ? ` (${data.departureCountry})` : ""}  {formatDate(data.departureDate)}
              {data.days > 0 ? ` ${data.days} 天` : ""}  團費{chargeWord}
            </Text>
            <Text style={[pdfStyles.tableCell, { flex: 1, textAlign: "center" }]}>
              {data.memberCount} 人
            </Text>
          </View>
        </View>

        {/* 收款資訊 */}
        <View style={{ marginTop: 10, gap: 4 }}>
          <Text>訂單編號: {data.orderNo}</Text>
          <Text>
            付款方式: {data.paymentMethodLabel}
            {data.bankTransferLast5 ? ` (帳號末五碼 ${data.bankTransferLast5})` : ""}
          </Text>
          <Text>付款狀態: {data.paymentStatusLabel}</Text>
          <Text>收款時間: {formatDateTime(data.paidAt)}</Text>
          <Text>應收合計: {formatCurrency(data.totalDue)}</Text>
        </View>

        <View style={{ marginTop: 12, gap: 5 }}>
          <Text style={{ fontSize: 12 }}>
            新台幣 (大寫): {amountInChinese(data.paidAmount)}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: "bold" }}>
            實收金額: {formatCurrency(data.paidAmount)} 元
          </Text>
        </View>

        <DoubleLine />

        {/* 簽章列 + 公司章 */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 16,
          }}
        >
          <View style={{ gap: 10 }}>
            <Text>主管:</Text>
            <Text>承辦人: {COMPANY.contactPerson}</Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={SEAL_PATH} style={{ width: 110 }} />
        </View>

        <Text style={pdfStyles.footer}>本收據由系統自動產生, 如有疑問請洽承辦人</Text>
      </Page>
    </Document>
  );
}
