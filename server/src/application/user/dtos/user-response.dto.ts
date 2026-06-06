// Response DTO — kiểm soát chính xác field nào trả ra ngoài

import { UserRole } from "@/domain/entities/user.entity";

// passwordHash không bao giờ xuất hiện ở đây
export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  role!: UserRole;
  createdAt!: Date;
  updatedAt!: Date;
}

