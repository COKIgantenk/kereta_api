import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePembelianDto } from './dto/create-pembelian.dto';
import {
  pembelianDetailInclude,
  presentPembelian,
} from './pembelian-presenter';
import { toDataURL } from 'qrcode';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class PembelianService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePembelianDto) {
    return this.prisma.$transaction(async (tx) => {
      const jadwal = await tx.jadwal.findUnique({
        where: { id: dto.jadwalId },
      });

      if (!jadwal) {
        throw new NotFoundException('Jadwal tidak ditemukan');
      }

      const kursiIds = dto.penumpang.map((p) => p.kursiId);

      const existing = await tx.detailPembelian.findMany({
        where: {
          jadwalId: dto.jadwalId,
          kursiId: { in: kursiIds },
        },
      });

      if (existing.length > 0) {
        throw new BadRequestException('Kursi sudah dibooking');
      }

      const kursiList = await tx.kursi.findMany({
        where: {
          id: { in: kursiIds },
        },
      });

      const pelanggan = await tx.pelanggan.findUnique({
        where: { userId },
      });

      if (!pelanggan) {
        throw new NotFoundException('Pelanggan tidak ditemukan');
      }

      const total = Number(jadwal.harga) * dto.penumpang.length;

      const pembelian = await tx.pembelian.create({
        data: {
          kodeBooking: `TRX-${Date.now()}`,
          pelangganId: pelanggan.id,
          jadwalId: dto.jadwalId,
          total,
          status: 'PENDING',
        },
      });

      const detailData = dto.penumpang.map((p) => {
        const kursi = kursiList.find((k) => k.id === p.kursiId);

        if (!kursi) {
          throw new BadRequestException('Kursi tidak ditemukan');
        }

        return {
          namaPenumpang: p.namaPenumpang,
          kursiId: p.kursiId,
          gerbongId: kursi.gerbongId,
          jadwalId: dto.jadwalId,
          pembelianId: pembelian.id,
        };
      });

      await tx.detailPembelian.createMany({
        data: detailData,
      });

      await tx.payment.create({
        data: {
          pembelianId: pembelian.id,
          qrImageUrl: null,
        },
      });

      const created = await tx.pembelian.findUnique({
        where: { id: pembelian.id },
        include: pembelianDetailInclude,
      });

      if (!created) {
        throw new NotFoundException('Pembelian tidak ditemukan');
      }

      return presentPembelian(created);
    });
  }

  async confirmPayment(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const data = await tx.pembelian.findUnique({
        where: { id },
      });

      if (!data) {
        throw new NotFoundException('Pembelian tidak ditemukan');
      }

      await tx.payment.update({
        where: { pembelianId: id },
        data: {
          paidAt: new Date(),
        },
      });

      const updated = await tx.pembelian.update({
        where: { id },
        data: {
          status: 'PAID',
        },
        include: pembelianDetailInclude,
      });

      return presentPembelian(updated);
    });
  }

  async cancelPembelian(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const data = await tx.pembelian.findUnique({
        where: { id },
        include: { jadwal: true },
      });

      if (!data) {
        throw new NotFoundException('Pembelian tidak ditemukan');
      }

      if (data.status !== 'PAID') {
        throw new BadRequestException('Hanya tiket PAID yang bisa dibatalkan');
      }

      const now = new Date();
      const batas = new Date(data.jadwal.tanggalBerangkat);
      batas.setHours(batas.getHours() - 2);

      if (now >= batas) {
        throw new BadRequestException('Refund ditutup (H-2 jam)');
      }

      await tx.payment.update({
        where: { pembelianId: id },
        data: {
          refundedAt: new Date(),
        },
      });

      const updated = await tx.pembelian.update({
        where: { id },
        data: {
          status: 'CANCELED',
        },
        include: pembelianDetailInclude,
      });

      return presentPembelian(updated);
    });
  }

  async getTiket(id: string) {
    const data = await this.prisma.pembelian.findUnique({
      where: { id },
      include: pembelianDetailInclude,
    });

    if (!data) {
      throw new NotFoundException('Pembelian tidak ditemukan');
    }

    if (data.status !== 'PAID') {
      throw new BadRequestException('Tiket belum tersedia');
    }

    return data;
  }

  async generateTiketPdf(id: string, res: Response) {
    const data = await this.getTiket(id);

    const qrData = JSON.stringify({
      kodeBooking: data.kodeBooking,
      id: data.id,
    });

    const qrImage = await toDataURL(qrData);

    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=tiket-${data.kodeBooking}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).text('TIKET KERETA', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Kode Booking: ${data.kodeBooking}`);
    doc.text(`Nama: ${data.pelanggan.nama}`);
    doc.text(`Kereta: ${data.jadwal.kereta.nama}`);
    doc.text(`Asal: ${data.jadwal.asal}`);
    doc.text(`Tujuan: ${data.jadwal.tujuan}`);
    doc.text(`Tanggal: ${data.jadwal.tanggalBerangkat.toISOString()}`);

    doc.moveDown();

    data.detail.forEach((d, i) => {
      doc.text(
        `Penumpang ${i + 1}: ${d.namaPenumpang} - ${d.kursi.label} (${d.gerbong.nama})`,
      );
    });

    doc.moveDown();

    const qrBase64 = qrImage.split(',')[1];
    const qrBuffer = Buffer.from(qrBase64, 'base64');

    doc.image(qrBuffer, {
      fit: [150, 150],
      align: 'center',
    });

    doc.end();
  }

  async findAll() {
    const data = await this.prisma.pembelian.findMany({
      include: pembelianDetailInclude,
      orderBy: { createdAt: 'desc' },
    });

    return data.map(presentPembelian);
  }

  async findMine(userId: string) {
    const pelanggan = await this.prisma.pelanggan.findUnique({
      where: { userId },
    });

    if (!pelanggan) {
      throw new NotFoundException('Pelanggan tidak ditemukan');
    }

    const data = await this.prisma.pembelian.findMany({
      where: { pelangganId: pelanggan.id },
      include: pembelianDetailInclude,
      orderBy: { createdAt: 'desc' },
    });

    return data.map(presentPembelian);
  }

  async findOne(id: string) {
    const data = await this.prisma.pembelian.findUnique({
      where: { id },
      include: pembelianDetailInclude,
    });

    if (!data) {
      throw new NotFoundException('Pembelian tidak ditemukan');
    }

    return presentPembelian(data);
  }
}
