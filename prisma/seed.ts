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
  } else {
    console.log(`管理員帳號已存在: ${adminUsername}`);
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
