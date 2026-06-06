// Response DTO — kiểm soát chính xác field nào trả ra ngoài

import { UserRole } from "@/domain/entities/user.entity";
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  id!: string;

  @ApiProperty({ example: 'Nguyen Van A' })
  name!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role!: UserRole;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;
}
