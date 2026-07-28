import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation/order-schema";
import { calculateFees } from "@/lib/fee-calculation";
import { generateOrderNo } from "@/lib/order-number";
import { createOrderAccessToken } from "@/lib/auth/order-access";
import { sendMail } from "@/lib/email/mailer";
import { orderConfirmationEmail } from "@/lib/email/templates/order-confirmation";
import { formatDate } from "@/lib/datetime";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "資料格式錯誤", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const tour = await prisma.tour.findUnique({ where: { id: input.tourId } });
  if (!tour || !tour.isActive) {
    return NextResponse.json({ error: "此團體不存在或已停止報名" }, { status: 404 });
  }

  // 驗證護照檔案：必須存在、類型正確、且尚未被其他訂單使用
  const passportFileIds = input.members.map((m) => m.passportFileId);
  const passportFiles = await prisma.uploadedFile.findMany({
    where: { id: { in: passportFileIds } },
  });
  const passportFileMap = new Map(passportFiles.map((f) => [f.id, f]));

  for (const fileId of passportFileIds) {
    const file = passportFileMap.get(fileId);
    if (!file || file.fileType !== "PASSPORT" || file.orderId) {
      return NextResponse.json({ error: "護照檔案無效或已被使用，請重新上傳" }, { status: 400 });
    }
  }

  let bankReceiptFile = null;
  if (input.paymentMethod === "BANK_TRANSFER" && input.bankReceiptFileId) {
    bankReceiptFile = await prisma.uploadedFile.findUnique({
      where: { id: input.bankReceiptFileId },
    });
    if (!bankReceiptFile || bankReceiptFile.fileType !== "BANK_RECEIPT" || bankReceiptFile.orderId) {
      return NextResponse.json({ error: "匯款收據檔案無效，請重新上傳" }, { status: 400 });
    }
  }

  // 伺服器端重新計算金額，不信任前端傳來的數字
  const fees = calculateFees(
    {
      pricePerPerson: tour.pricePerPerson,
      discountAmount: tour.discountAmount,
      discountMode: tour.discountMode,
      depositAmount: tour.depositAmount,
      depositMode: tour.depositMode,
    },
    input.memberCount
  );

  const orderNo = await generateOrderNo();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNo,
        tourId: tour.id,
        memberCount: input.memberCount,
        pricePerPersonSnapshot: tour.pricePerPerson,
        discountAmountSnapshot: tour.discountAmount,
        discountModeSnapshot: tour.discountMode,
        depositAmountSnapshot: tour.depositAmount,
        depositModeSnapshot: tour.depositMode,
        subtotal: fees.subtotal,
        totalDiscount: fees.totalDiscount,
        totalDue: fees.totalDue,
        depositRequired: fees.depositRequired,
        balanceDue: fees.balanceDue,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        contactEmail: input.contactEmail,
        paymentMethod: input.paymentMethod,
        paymentStatus: "UNPAID",
        bankTransferLast5:
          input.paymentMethod === "BANK_TRANSFER" ? input.bankTransferLast5 : null,
        bankReceiptFileId: bankReceiptFile?.id ?? null,
        members: {
          create: input.members.map((member, index) => ({
            sortOrder: index + 1,
            chineseName: member.chineseName,
            passportEnglishName: member.passportEnglishName,
            passportNumber: member.passportNumber,
            passportExpiry: member.passportExpiry,
            specialDiet: member.specialDiet || null,
            passportFileId: member.passportFileId,
          })),
        },
      },
      include: { members: true },
    });

    await tx.uploadedFile.updateMany({
      where: { id: { in: passportFileIds } },
      data: { orderId: created.id },
    });
    if (bankReceiptFile) {
      await tx.uploadedFile.update({
        where: { id: bankReceiptFile.id },
        data: { orderId: created.id },
      });
    }

    return created;
  });

  const accessToken = await createOrderAccessToken(order.id);

  const receiptUrl = `${process.env.APP_BASE_URL ?? "http://localhost:3000"}/tour/${tour.id}/success/${order.id}?t=${accessToken}`;

  const emailData = {
    orderNo: order.orderNo,
    tourName: tour.name,
    departureDate: formatDate(tour.departureDate),
    memberCount: order.memberCount,
    totalDue: order.totalDue,
    depositRequired: order.depositRequired,
    balanceDue: order.balanceDue,
    contactName: order.contactName,
    receiptUrl,
  };
  const { subject, html } = orderConfirmationEmail(emailData);
  const notifyEmail = process.env.NOTIFY_EMAIL;
  const recipients = notifyEmail ? [order.contactEmail, notifyEmail] : [order.contactEmail];
  const mailResult = await sendMail({ to: recipients, subject, html });

  await prisma.order.update({
    where: { id: order.id },
    data: { confirmationEmailSentAt: mailResult.ok ? new Date() : null },
  });

  return NextResponse.json(
    {
      orderId: order.id,
      orderNo: order.orderNo,
      token: accessToken,
      paymentMethod: order.paymentMethod,
    },
    { status: 201 }
  );
}
