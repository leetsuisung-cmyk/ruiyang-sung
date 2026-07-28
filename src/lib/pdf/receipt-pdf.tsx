import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/datetime";
import { CompanyHeader } from "./CompanyHeader";
import { pdfStyles } from "./styles";

export interface ReceiptPdfData {
  orderNo: string;
  tourName: string;
  departureCountry: string;
  departureDate: Date;
  days: number;
  memberCount: number;
  subtotal: number;
  totalDiscount: number;
  totalDue: number;
  depositRequired: number;
  balanceDue: number;
  contactName: string;
  paymentMethodLabel: string;
  paymentStatusLabel: string;
  createdAt: Date;
}

export function ReceiptPdfDocument({ data }: { data: ReceiptPdfData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <CompanyHeader />
        <Text style={pdfStyles.title}>線上報名收據</Text>

        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>訂單編號</Text>
          <Text style={pdfStyles.rowValue}>{data.orderNo}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>開立日期</Text>
          <Text style={pdfStyles.rowValue}>{formatDateTime(data.createdAt)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>團名</Text>
          <Text style={pdfStyles.rowValue}>{data.tourName}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>出發國家/目的地</Text>
          <Text style={pdfStyles.rowValue}>{data.departureCountry}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>出發日期</Text>
          <Text style={pdfStyles.rowValue}>
            {formatDate(data.departureDate)} ({data.days} 天)
          </Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>報名人數</Text>
          <Text style={pdfStyles.rowValue}>{data.memberCount} 人</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>聯絡人</Text>
          <Text style={pdfStyles.rowValue}>{data.contactName}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>付款方式</Text>
          <Text style={pdfStyles.rowValue}>{data.paymentMethodLabel}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>付款狀態</Text>
          <Text style={pdfStyles.rowValue}>{data.paymentStatusLabel}</Text>
        </View>

        <Text style={pdfStyles.sectionTitle}>費用明細</Text>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>小計</Text>
          <Text style={pdfStyles.rowValue}>{formatCurrency(data.subtotal)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>優惠金額</Text>
          <Text style={pdfStyles.rowValue}>- {formatCurrency(data.totalDiscount)}</Text>
        </View>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>應收合計</Text>
          <Text style={pdfStyles.totalValue}>{formatCurrency(data.totalDue)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>已收訂金</Text>
          <Text style={pdfStyles.rowValue}>{formatCurrency(data.depositRequired)}</Text>
        </View>
        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>尚欠尾款</Text>
          <Text style={pdfStyles.totalValue}>{formatCurrency(data.balanceDue)}</Text>
        </View>

        <Text style={pdfStyles.footer}>本收據由系統自動產生, 如有疑問請洽承辦人</Text>
      </Page>
    </Document>
  );
}
