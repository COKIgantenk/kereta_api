# Prisma Seed

Seed ini membuat atau memperbarui akun **super admin** yang bisa login normal lewat endpoint `POST /api/auth/login` dan memakai semua endpoint yang membutuhkan role `ADMIN`.

## Environment Variable

Seed membaca variable berikut:

| Variable               | Default         | Keterangan                  |
| ---------------------- | --------------- | --------------------------- |
| `SUPER_ADMIN_USERNAME` | `superadmin`    | Username super admin        |
| `SUPER_ADMIN_PASSWORD` | `superadmin123` | Password super admin        |
| `SUPER_ADMIN_NAME`     | `Super Admin`   | Nama petugas/admin          |
| `SUPER_ADMIN_ADDRESS`  | `-`             | Alamat petugas/admin        |
| `SUPER_ADMIN_PHONE`    | `-`             | Nomor telepon petugas/admin |

Jika `SUPER_ADMIN_USERNAME` atau `SUPER_ADMIN_PASSWORD` tidak diisi, seed juga masih menerima fallback lama `ADMIN_USERNAME` dan `ADMIN_PASSWORD`.

## Cara Menjalankan

```bash
npm run prisma:seed
```

Atau saat deploy, script `npm run deploy` sudah menjalankan seed setelah migration deploy.

## Login Super Admin

Gunakan endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "username": "superadmin",
  "password": "superadmin123"
}
```

Ubah username/password sesuai environment variable yang kamu isi.
