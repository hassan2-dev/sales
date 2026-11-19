import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = await prisma.user.findMany({
  where: { role: { code: 'CUSTOMER' }, customer: null },
  select: {
    id: true,
    email: true,
    phone: true,
    firstName: true,
    lastName: true,
  },
});

let linked = 0;
let created = 0;

for (const user of users) {
  const byPhone = user.phone
    ? await prisma.customer.findFirst({
        where: { phone: user.phone },
        orderBy: { createdAt: 'asc' },
      })
    : null;

  if (byPhone && !byPhone.userId) {
    await prisma.customer.update({
      where: { id: byPhone.id },
      data: {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
    });
    linked += 1;
    console.log(`linked ${user.firstName} ${user.lastName} ${user.phone}`);
    continue;
  }

  if (!byPhone) {
    await prisma.customer.create({
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
    created += 1;
    console.log(`created ${user.firstName} ${user.lastName} ${user.phone}`);
  }
}

const named = await prisma.customer.findMany({
  where: {
    OR: [
      { firstName: { contains: 'حسن', mode: 'insensitive' } },
      { firstName: { contains: 'hasan', mode: 'insensitive' } },
      { lastName: { contains: 'عدنان', mode: 'insensitive' } },
      { lastName: { contains: 'adnan', mode: 'insensitive' } },
    ],
  },
  select: { firstName: true, lastName: true, phone: true, email: true },
});

console.log(`done created=${created} linked=${linked}`);
console.log('matches', named);
await prisma.$disconnect();
