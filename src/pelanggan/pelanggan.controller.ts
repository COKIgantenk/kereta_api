import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PelangganService } from './pelanggan.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdatePelangganDto } from './dto/update-pelanggan.dto';
import type { AuthenticatedRequest } from 'src/common/types/authenticated-request.interface';

@ApiBearerAuth()
@Controller('pelanggan')
export class PelangganController {
  constructor(private readonly pelangganService: PelangganService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findAll() {
    return this.pelangganService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: AuthenticatedRequest) {
    return this.pelangganService.findByUserId(req.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() req: AuthenticatedRequest,
    @Body() body: UpdatePelangganDto,
  ) {
    return this.pelangganService.updateByUserId(req.user.sub, body);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.pelangganService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() body: UpdatePelangganDto) {
    return this.pelangganService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.pelangganService.remove(id);
  }
}
