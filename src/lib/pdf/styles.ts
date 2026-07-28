import { StyleSheet } from "@react-pdf/renderer";
import { FONT_FAMILY } from "./fonts";

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    padding: 32,
    color: "#111827",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  companyBlock: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottom: "1px solid #d1d5db",
  },
  companyName: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 3,
  },
  companyLine: {
    fontSize: 9,
    color: "#374151",
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
  },
  rowLabel: {
    width: "35%",
    color: "#4b5563",
  },
  rowValue: {
    width: "65%",
  },
  table: {
    marginTop: 6,
    borderTop: "1px solid #d1d5db",
    borderLeft: "1px solid #d1d5db",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 5,
    fontWeight: "bold",
    backgroundColor: "#f3f4f6",
    borderRight: "1px solid #d1d5db",
    borderBottom: "1px solid #d1d5db",
  },
  tableCell: {
    flex: 1,
    padding: 5,
    borderRight: "1px solid #d1d5db",
    borderBottom: "1px solid #d1d5db",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderTop: "1px solid #d1d5db",
    marginTop: 4,
  },
  totalLabel: {
    fontWeight: "bold",
  },
  totalValue: {
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    fontSize: 8,
    color: "#9ca3af",
    textAlign: "center",
  },
});
