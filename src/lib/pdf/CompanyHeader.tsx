import { Text, View } from "@react-pdf/renderer";
import { COMPANY } from "@/lib/constants/company";
import { pdfStyles } from "./styles";

export function CompanyHeader() {
  return (
    <View style={pdfStyles.companyBlock}>
      <Text style={pdfStyles.companyName}>{COMPANY.name}</Text>
      <Text style={pdfStyles.companyLine}>{COMPANY.address}</Text>
      <Text style={pdfStyles.companyLine}>
        電話: {COMPANY.phone}  傳真: {COMPANY.fax}
      </Text>
      <Text style={pdfStyles.companyLine}>承辦人: {COMPANY.contactPerson}</Text>
    </View>
  );
}

export function BankAccountBlock() {
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={pdfStyles.companyLine}>
        匯款帳戶: {COMPANY.bank.bankName} {COMPANY.bank.branchName}
      </Text>
      <Text style={pdfStyles.companyLine}>戶名: {COMPANY.bank.accountName}</Text>
      <Text style={pdfStyles.companyLine}>帳號: {COMPANY.bank.accountNumber}</Text>
    </View>
  );
}
