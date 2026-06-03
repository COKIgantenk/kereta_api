import { Prisma, StatusPembelian } from '@prisma/client';

export const pembelianDetailInclude =
  Prisma.validator<Prisma.PembelianInclude>()({
    pelanggan: true,
    detail: {
      include: {
        kursi: true,
        gerbong: true,
      },
    },
    jadwal: {
      include: {
        kereta: true,
      },
    },
    payment: true,
  });

export type PembelianDetail = Prisma.PembelianGetPayload<{
  include: typeof pembelianDetailInclude;
}>;

export type StatusPemesanan = 'BOOKED' | 'SUCCESS' | 'CANCELED';

export function getStatusPemesanan(status: StatusPembelian): StatusPemesanan {
  switch (status) {
    case 'PENDING':
      return 'BOOKED';
    case 'PAID':
      return 'SUCCESS';
    case 'CANCELED':
      return 'CANCELED';
  }
}

export function presentPembelian(data: PembelianDetail) {
  const statusPemesanan = getStatusPemesanan(data.status);

  return {
    ...data,
    statusPemesanan,
    statusPesanan: statusPemesanan,
    bookingStatus: statusPemesanan.toLowerCase(),
    ringkasanTiket: {
      kodeBooking: data.kodeBooking,
      statusPemesanan,
      kereta: data.jadwal.kereta,
      asal: data.jadwal.asal,
      tujuan: data.jadwal.tujuan,
      tanggalBerangkat: data.jadwal.tanggalBerangkat,
      tanggalTiba: data.jadwal.tanggalTiba,
      total: data.total,
      penumpang: data.detail.map((detail) => ({
        id: detail.id,
        namaPenumpang: detail.namaPenumpang,
        kursi: detail.kursi,
        gerbong: detail.gerbong,
      })),
    },
  };
}
