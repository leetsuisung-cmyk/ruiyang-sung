import ExcelJS from "exceljs";
import type { RoomingListRow } from "@/lib/pdf/rooming-list-pdf";

export async function buildRoomingListExcel(
  tourName: string,
  rows: RoomingListRow[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("分房表");

  sheet.columns = [
    { header: "ROOM NO", key: "roomNo", width: 12 },
    { header: "姓名", key: "chineseName", width: 16 },
    { header: "電話", key: "phone", width: 18 },
    { header: "特殊飲食", key: "specialDiet", width: 24 },
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEFEFEF" },
  };

  for (const row of rows) {
    sheet.addRow({
      roomNo: row.roomNo || "",
      chineseName: row.chineseName,
      phone: row.phone || "",
      specialDiet: row.specialDiet || "",
    });
  }

  sheet.getColumn("roomNo").alignment = { horizontal: "center" };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
