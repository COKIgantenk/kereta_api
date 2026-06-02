import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Req,
  Patch,
  Res,
} from '@nestjs/common';
import { PembelianService } from './pembelian.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreatePembelianDto } from './dto/create-pembelian.dto';
import express from 'express';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.interface';

@Controller('pembelian')
export class PembelianController {
  constructor(private readonly pembelianService: PembelianService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePembelianDto) {
    return this.pembelianService.create(req.user.sub, dto);
  }

  @Patch(':id/confirm')
  @UseGuards(JwtAuthGuard)
  confirm(@Param('id') id: string) {
    return this.pembelianService.confirmPayment(id);
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  cancel(@Param('id') id: string) {
    return this.pembelianService.cancelPembelian(id);
  }

  @Get(':id/tiket')
  @UseGuards(JwtAuthGuard)
  generateTiket(@Param('id') id: string, @Res() res: express.Response) {
    return this.pembelianService.generateTiketPdf(id, res);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.pembelianService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.pembelianService.findOne(id);
  }
}
