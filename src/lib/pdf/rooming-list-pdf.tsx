import { Document, Page, Text, View } from "@react-pdf/renderer";
import { formatDate } from "@/lib/datetime";
import { CompanyHeader } from "./CompanyHeader";
import { pdfStyles } from "./styles";

export interface RoomingListRow {
  roomNo: string;
  chineseName: string;
  passportEnglishName: string;
  passportNumber: string;
  specialDiet: string;
}

export interface RoomingListPdfData {
  tourName: string;
  departureDate: Date;
  orderNo: string;
  rows: RoomingListRow[];
}

export function RoomingListPdfDocument({ data }: { data: RoomingListPdfData }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={pdfStyles.page}>
        <CompanyHeader />
        <Text style={pdfStyles.title}>分房表 Rooming List</Text>

        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>團名</Text>
          <Text style={pdfStyles.rowValue}>{data.tourName}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>出發日期</Text>
          <Text style={pdfStyles.rowValue}>{formatDate(data.departureDate)}</Text>
        </View>
        <View style={pdfStyles.row}>
          <Text style={pdfStyles.rowLabel}>訂單編號</Text>
          <Text style={pdfStyles.rowValue}>{data.orderNo}</Text>
        </View>

        <View style={pdfStyles.table}>
          <View style={pdfStyles.tableRow}>
            <Text style={pdfStyles.tableHeaderCell}>ROOM NO</Text>
            <Text style={pdfStyles.tableHeaderCell}>姓名</Text>
            <Text style={pdfStyles.tableHeaderCell}>護照英文姓名</Text>
            <Text style={pdfStyles.tableHeaderCell}>護照號碼</Text>
            <Text style={pdfStyles.tableHeaderCell}>特殊飲食</Text>
          </View>
          {data.rows.map((row, i) => (
            <View style={pdfStyles.tableRow} key={i}>
              <Text style={pdfStyles.tableCell}>{row.roomNo || "-"}</Text>
              <Text style={pdfStyles.tableCell}>{row.chineseName}</Text>
              <Text style={pdfStyles.tableCell}>{row.passportEnglishName}</Text>
              <Text style={pdfStyles.tableCell}>{row.passportNumber}</Text>
              <Text style={pdfStyles.tableCell}>{row.specialDiet || "-"}</Text>
            </View>
          ))}
        </View>

        <Text style={pdfStyles.footer}>本分房表由系統自動產生</Text>
      </Page>
    </Document>
  );
}
