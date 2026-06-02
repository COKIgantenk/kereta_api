import { IsOptional, IsString } from 'class-validator';

export class UpdatePelangganDto {
  @IsOptional()
  @IsString()
  nama?: string;

  @IsOptional()
  @IsString()
  alamat?: string;

  @IsOptional()
  @IsString()
  telp?: string;
}
