import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatCurrency, formatDate } from "@/lib/datetime";
import { BankAccountBlock, CompanyHeader } from "./CompanyHeader";
import { pdfStyles } from "./styles";

export interface InvoicePdfData {
  orderNo: string;
  tourName: string;
  departureDate: Date;
  memberCount: number;
  pricePerPerson: number;
  subtotal: number;
  totalDiscount: number;
  totalDue: number;
  issuedDate: Date;
}

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <CompanyHeader />
        <Text style={pdfStyles.title}>請款單</Text>

        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>團號</Text>
          <Text style={pdfStyles.rowValue}>{data.orderNo}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>摘要</Text>
          <Text style={pdfStyles.rowValue}>{data.tourName}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>出發日期</Text>
          <Text style={pdfStyles.rowValue}>{formatDate(data.departureDate)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>數量</Text>
          <Text style={pdfStyles.rowValue}>{data.memberCount} 人</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>開立日期</Text>
          <Text style={pdfStyles.rowValue}>{formatDate(data.issuedDate)}</Text>
        </View>

        <Text style={pdfStyles.sectionTitle}>團費明細</Text>
        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableHeaderCell}>項目</Text>
            <Text style={pdfStyles.tableHeaderCell}>單價</Text>
            <Text style={pdfStyles.tableHeaderCell}>數量</Text>
            <Text style={pdfStyles.tableHeaderCell}>金額</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCell}>{data.tourName} 團費</Text>
            <Text style={pdfStyles.tableCell}>{formatCurrency(data.pricePerPerson)}</Text>
            <Text style={pdfStyles.tableCell}>{data.memberCount}</Text>
            <Text style={pdfStyles.tableCell}>{formatCurrency(data.subtotal)}</Text>
          </View>
          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableCell}>優惠折抵</Text>
            <Text style={pdfStyles.tableCell}>-</Text>
            <Text style={pdfStyles.tableCell}>-</Text>
            <Text style={pdfStyles.tableCell}>- {formatCurrency(data.totalDiscount)}</Text>
          </View>
        </View>

        <View style={pdfStyles.totalRow}>
          <Text style={pdfStyles.totalLabel}>應收合計</Text>
          <Text style={pdfStyles.totalValue}>{formatCurrency(data.totalDue)}</Text>
        </View>

        <Text style={pdfStyles.sectionTitle}>匯款資訊</Text>
        <BankAccountBlock />

        <Text style={pdfStyles.footer}>本請款單由系統自動產生</Text>
      </Page>
    </Document>
  );
}
