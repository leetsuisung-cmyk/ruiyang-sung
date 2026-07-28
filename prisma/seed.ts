import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

  const existingAdmin = await prisma.admin.findUnique({ where: { username: adminUsername } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        username: adminUsername,
        passwordHash: await hashPassword(adminPassword),
      },
    });
    console.log(`已建立管理員帳號: ${adminUsername}`);
  } else if (process.env.ADMIN_PASSWORD) {
    // 有明確設定 ADMIN_PASSWORD 時，以環境變數為準更新密碼（讓部署平台改密碼能生效）
    await prisma.admin.update({
      where: { username: adminUsername },
      data: { passwordHash: await hashPassword(adminPassword) },
    });
    console.log(`已依環境變數更新管理員密碼: ${adminUsername}`);
  } else {
    console.log(`管理員帳號已存在: ${adminUsername}`);
  }

  // 單一管理員系統：若改過 ADMIN_USERNAME，移除其他舊帳號，避免舊帳密仍可登入
  const removed = await prisma.admin.deleteMany({ where: { username: { not: adminUsername } } });
  if (removed.count > 0) {
    console.log(`已移除 ${removed.count} 個舊管理員帳號`);
  }

  const existingTour = await prisma.tour.findFirst({ where: { name: "東北5日" } });
  if (!existingTour) {
    const departureDate = new Date();
    departureDate.setMonth(departureDate.getMonth() + 2);

    const tour = await prisma.tour.create({
      data: {
        name: "東北5日",
        departureCountry: "日本東北",
        departureDate,
        days: 5,
        pricePerPerson: 35900,
        discountAmount: 1000,
        discountMode: "PER_PERSON",
        depositAmount: 10000,
        depositMode: "PER_PERSON",
        isActive: true,
      },
    });
    console.log(`已建立範例團: ${tour.name} (id: ${tour.id})`);
  } else {
    console.log(`範例團已存在: ${existingTour.name} (id: ${existingTour.id})`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
