import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const superAdmin = {
  username:
    process.env.SUPER_ADMIN_USERNAME ??
    process.env.ADMIN_USERNAME ??
    'superadmin',
  password:
    process.env.SUPER_ADMIN_PASSWORD ??
    process.env.ADMIN_PASSWORD ??
    'superadmin123',
  nama: process.env.SUPER_ADMIN_NAME ?? 'Super Admin',
  alamat: process.env.SUPER_ADMIN_ADDRESS ?? '-',
  telp: process.env.SUPER_ADMIN_PHONE ?? '-',
};

async function main() {
  const hashedPassword = await hash(superAdmin.password, 10);

  const user = await prisma.user.upsert({
    where: { username: superAdmin.username },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      username: superAdmin.username,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.petugas.upsert({
    where: { userId: user.id },
    update: {
      nama: superAdmin.nama,
      alamat: superAdmin.alamat,
      telp: superAdmin.telp,
    },
    create: {
      nama: superAdmin.nama,
      alamat: superAdmin.alamat,
      telp: superAdmin.telp,
      userId: user.id,
    },
  });

  console.log(`Super admin siap digunakan: ${superAdmin.username}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
