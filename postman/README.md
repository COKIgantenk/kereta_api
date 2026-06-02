# Postman Collection - Rail Nusantara / Kereta API

File di folder ini dibuat supaya request Postman tidak perlu diisi manual satu per satu.

## File

- `rail-nusantara.postman_collection.json` — collection semua endpoint API.
- `rail-nusantara.local.postman_environment.json` — environment lokal dengan variable siap pakai.

## Cara Pakai Cepat

1. Jalankan API lokal, contoh: `npm run start:dev`.
2. Buka Postman, lalu **Import** dua file JSON di folder ini.
3. Pilih environment **Rail Nusantara Local**.
4. Buka collection **Rail Nusantara / Kereta API**.
5. Jalankan folder **00 - Alur Cepat (Auto Isi Variabel)** dari atas ke bawah.

Folder alur cepat akan otomatis menyimpan token dan ID penting ke collection variable/environment, seperti:

- `adminToken`
- `pelangganToken`
- `keretaId`
- `gerbongId`
- `kursiId`
- `jadwalId`
- `pembelianId`

Jika request `Bootstrap Admin` atau `Register Pelanggan` mengembalikan pesan data sudah ada, lanjutkan saja ke request login karena token akan diisi dari request login.

## Variable Default

- `hostUrl`: `http://localhost:3000`
- `baseUrl`: `http://localhost:3000/api`
- `adminUsername`: `admin`
- `adminPassword`: `password123`
- `pelangganUsername`: `pelanggan1`
- `pelangganPassword`: `password123`
- `newAdminUsername`: `admin2`
- `newAdminPassword`: `password123`

Ubah variable ini hanya jika port/server atau credential lokal berbeda.

## Register Admin Baru

Setelah login sebagai super admin/admin dan `adminToken` tersimpan, gunakan request **Auth → Register Admin (Admin Only)** untuk membuat akun admin tambahan tanpa mengubah role manual di database.
