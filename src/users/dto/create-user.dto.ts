import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

enum UserRoleDto {
  ADMIN = 'ADMIN',
  PELANGGAN = 'PELANGGAN',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsEnum(UserRoleDto)
  role!: UserRoleDto;
}
