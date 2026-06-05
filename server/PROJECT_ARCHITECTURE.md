# Project Architecture

> NestJS + MongoDB — Clean Architecture  
> Tài liệu này dành cho developer mới onboard. Đọc kỹ trước khi bắt đầu implement feature mới.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Quy tắc đặt tên](#3-quy-tắc-đặt-tên)
4. [Dependency Rule](#4-dependency-rule)
5. [Luồng xử lý request](#5-luồng-xử-lý-request)
6. [Response format chuẩn](#6-response-format-chuẩn)
7. [Hướng dẫn thêm feature mới](#7-hướng-dẫn-thêm-feature-mới)
8. [Các pattern quan trọng](#8-các-pattern-quan-trọng)
9. [Môi trường và cấu hình](#9-môi-trường-và-cấu-hình)

---

## 1. Tổng quan kiến trúc

Dự án áp dụng **Clean Architecture** chia thành 4 layer độc lập:

```
┌─────────────────────────────────────────────┐
│              Presentation Layer             │  ← HTTP Controllers, Guards, Pipes
├─────────────────────────────────────────────┤
│              Application Layer              │  ← Use-cases, DTOs, Mappers
├─────────────────────────────────────────────┤
│               Domain Layer                  │  ← Entities, Repository Interfaces, Exceptions
├─────────────────────────────────────────────┤
│            Infrastructure Layer             │  ← Mongoose Schemas, Repository Impls, Services
└─────────────────────────────────────────────┘
```

| Layer | Trách nhiệm | Được phép import |
|---|---|---|
| **Domain** | Nghiệp vụ cốt lõi | Không import gì ngoài TypeScript built-in |
| **Application** | Điều phối use-cases | Domain layer |
| **Infrastructure** | Chi tiết kỹ thuật (DB, email...) | Domain layer, thư viện bên ngoài |
| **Presentation** | Giao tiếp HTTP | Application layer |

---

## 2. Cấu trúc thư mục

```
src/
│
├── domain/                            # Layer 1 — Lõi nghiệp vụ
│   ├── entities/
│   │   └── user.entity.ts             # Pure class, không import NestJS/Mongoose
│   ├── repositories/
│   │   └── user.repository.interface.ts   # Interface + Symbol injection token
│   └── exceptions/
│       └── user.exception.ts          # Domain-specific errors
│
├── application/                       # Layer 2 — Use-cases
│   ├── dtos/
│   │   ├── create-user.dto.ts         # Input validation
│   │   ├── update-user.dto.ts
│   │   ├── query-user.dto.ts          # Query params (pagination, filter)
│   │   └── user-response.dto.ts       # Output shape (không bao giờ expose passwordHash)
│   ├── mappers/
│   │   └── user.mapper.ts             # Entity → ResponseDto
│   ├── use-cases/
│   │   ├── create-user.use-case.ts
│   │   ├── find-all-users.use-case.ts
│   │   ├── find-user-by-id.use-case.ts
│   │   ├── update-user.use-case.ts
│   │   └── delete-user.use-case.ts
│   └── application.module.ts
│
├── infrastructure/                    # Layer 3 — Triển khai kỹ thuật
│   ├── database/
│   │   └── schemas/
│   │       └── user.schema.ts         # Mongoose @Schema class
│   ├── repositories/
│   │   └── user.repository.impl.ts    # Implement IUserRepository
│   └── infrastructure.module.ts
│
├── presentation/                      # Layer 4 — HTTP interface
│   ├── controllers/
│   │   └── user.controller.ts
│   └── presentation.module.ts
│
├── shared/                            # Dùng chung, không thuộc layer nào
│   ├── config/
│   │   └── env.validation.ts          # Validate biến môi trường khi khởi động
│   ├── decorators/
│   │   └── response-message.decorator.ts
│   ├── filters/
│   │   ├── domain-exception.filter.ts # Map domain error → HTTP status
│   │   └── http-exception.filter.ts   # Map NestJS HttpException → chuẩn response
│   ├── interceptors/
│   │   └── response.interceptor.ts    # Wrap mọi response về cùng shape
│   └── response/
│       └── api-response.dto.ts        # ApiResponseDto + PaginationMeta
│
├── app.module.ts                      # Root module — import MongooseModule, PresentationModule
└── main.ts                            # Bootstrap — đăng ký global filters, interceptor, pipe
```

### Quy tắc tổ chức thư mục

- Mỗi **domain entity** (User, Order, Product...) có đủ 4 layer tương ứng.
- Thêm entity mới → tạo file theo đúng pattern, **không sửa** file của entity khác.
- `shared/` chỉ chứa code **không phụ thuộc** vào bất kỳ domain cụ thể nào.
- Không tạo thư mục `utils/` tự do — helper function phải nằm đúng layer.

---

## 3. Quy tắc đặt tên

### File

| Loại | Pattern | Ví dụ |
|---|---|---|
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Repository interface | `{name}.repository.interface.ts` | `user.repository.interface.ts` |
| Repository impl | `{name}.repository.impl.ts` | `user.repository.impl.ts` |
| Mongoose schema | `{name}.schema.ts` | `user.schema.ts` |
| Use-case | `{action}-{name}.use-case.ts` | `create-user.use-case.ts` |
| DTO | `{action}-{name}.dto.ts` | `create-user.dto.ts` |
| Response DTO | `{name}-response.dto.ts` | `user-response.dto.ts` |
| Mapper | `{name}.mapper.ts` | `user.mapper.ts` |
| Controller | `{name}.controller.ts` | `user.controller.ts` |
| Module | `{name}.module.ts` | `users.module.ts` |
| Filter | `{name}.filter.ts` | `domain-exception.filter.ts` |
| Interceptor | `{name}.interceptor.ts` | `response.interceptor.ts` |
| Decorator | `{name}.decorator.ts` | `response-message.decorator.ts` |
| Guard | `{name}.guard.ts` | `jwt-auth.guard.ts` |

> **Quy tắc chung:** Tất cả tên file dùng **kebab-case**, không dùng camelCase hay PascalCase cho tên file.

### Class

| Loại | Pattern | Ví dụ |
|---|---|---|
| Entity | `PascalCase` | `User`, `OrderItem` |
| Use-case | `{Action}{Name}UseCase` | `CreateUserUseCase` |
| Repository interface | `I{Name}Repository` | `IUserRepository` |
| Repository impl | `{Name}RepositoryImpl` | `UserRepositoryImpl` |
| Mongoose schema class | `{Name}SchemaClass` | `UserSchemaClass` |
| DTO | `{Action}{Name}Dto` | `CreateUserDto` |
| Response DTO | `{Name}ResponseDto` | `UserResponseDto` |
| Mapper | `{Name}Mapper` | `UserMapper` |
| Controller | `{Name}Controller` | `UserController` |
| Module | `{Name}Module` | `UsersModule` |
| Filter | `{Name}Filter` | `DomainExceptionFilter` |
| Interceptor | `{Name}Interceptor` | `ResponseInterceptor` |
| Exception | `{Name}Exception` | `UserNotFoundException` |
| Enum | `PascalCase` | `UserRole` |

### Biến và hàm

| Loại | Pattern | Ví dụ |
|---|---|---|
| Biến thường | `camelCase` | `userId`, `totalPages` |
| Hàm/method | `camelCase` động từ đứng đầu | `findById()`, `toResponse()` |
| Hằng số | `SCREAMING_SNAKE_CASE` | `USER_REPOSITORY`, `MAX_RETRY` |
| Injection token (Symbol) | `SCREAMING_SNAKE_CASE` | `USER_REPOSITORY` |
| Biến môi trường | `SCREAMING_SNAKE_CASE` | `MONGODB_URI`, `JWT_SECRET` |
| Enum value | `SCREAMING_SNAKE_CASE` | `UserRole.ADMIN`, `UserRole.USER` |
| Private class field | `camelCase` với prefix `_` (tuỳ chọn) | `_userRepository` hoặc `userRepository` |
| Boolean | Prefix `is`, `has`, `can` | `isDeleted()`, `hasPermission` |

### Interface

```typescript
// ✅ Đúng — prefix I cho repository interface
export interface IUserRepository { ... }

// ✅ Đúng — không prefix I cho DTO-like interface
export interface FindAllOptions { ... }
export interface FindAllUsersResult { ... }

// ❌ Sai — không prefix I cho object shape thông thường
export interface IFindAllOptions { ... }
```

### Injection Token

```typescript
// ✅ Dùng Symbol, đặt trong cùng file với interface
export const USER_REPOSITORY = Symbol('IUserRepository');

// ❌ Không dùng string — dễ bị trùng tên
export const USER_REPOSITORY = 'IUserRepository';
```

---

## 4. Dependency Rule

**Quy tắc bất di bất dịch:** Dependency chỉ được đi từ ngoài vào trong.

```
Presentation → Application → Domain ← Infrastructure
```

```typescript
// ✅ Đúng — Application import Domain
import { User } from '../../domain/entities/user.entity';

// ✅ Đúng — Infrastructure import Domain interface để implement
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

// ❌ Sai — Domain không được import bất cứ thứ gì
import { Injectable } from '@nestjs/common';  // KHÔNG làm thế này trong domain/

// ❌ Sai — Application không được biết Infrastructure tồn tại
import { UserSchemaClass } from '../../infrastructure/database/schemas/user.schema';

// ❌ Sai — Domain không được import Application
import { CreateUserDto } from '../../application/dtos/create-user.dto';
```

---

## 5. Luồng xử lý request

### Luồng bình thường (Happy path)

```
HTTP Request
    │
    ▼
[ValidationPipe]          — class-validator kiểm tra DTO
    │
    ▼
[Controller]              — gọi đúng use-case, không có business logic
    │
    ▼
[Use-case]                — business logic, gọi IRepository (interface)
    │
    ▼
[RepositoryImpl]          — Mongoose query, map Document → Entity
    │
    ▼
[MongoDB]
    │
    ▼ (kết quả trả ngược lên)
[Use-case]                — map Entity → ResponseDto qua Mapper
    │
    ▼
[ResponseInterceptor]     — wrap vào ApiResponseDto chuẩn
    │
    ▼
HTTP Response { success, statusCode, message, data }
```

### Luồng khi có lỗi (Error path)

```
Use-case throw UserNotFoundException
    │
    ▼
[DomainExceptionFilter]   — bắt domain exception, map sang HTTP 404
    │
    ▼
HTTP Response { success: false, statusCode: 404, message, error }
```

```
ValidationPipe throw BadRequestException
    │
    ▼
[HttpExceptionFilter]     — bắt NestJS exception, chuẩn hóa message
    │
    ▼
HTTP Response { success: false, statusCode: 400, message, error }
```

---

## 6. Response format chuẩn

Mọi API đều trả về cùng shape. **Không bao giờ** trả raw object từ controller.

### Response thành công — single object

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Nguyen Van A",
    "email": "a@example.com",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Response thành công — danh sách có phân trang

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [...],
  "pagination": {
    "total": 20,
    "page": 2,
    "limit": 5,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

> **Cơ chế tự động:** Use-case trả về object có shape `{ data, total, page, limit }` thì `ResponseInterceptor` tự detect và thêm `pagination`. Developer không cần xử lý thủ công.

### Response lỗi

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User with id \"abc\" not found",
  "error": "UserNotFoundException"
}
```

### HTTP status code chuẩn

| Action | Status |
|---|---|
| `POST` tạo thành công | `201 Created` |
| `GET`, `PATCH` thành công | `200 OK` |
| `DELETE` thành công | `204 No Content` |
| Validation lỗi | `400 Bad Request` |
| Chưa xác thực | `401 Unauthorized` |
| Không có quyền | `403 Forbidden` |
| Không tìm thấy | `404 Not Found` |
| Trùng dữ liệu | `409 Conflict` |
| Đã bị xóa mềm | `410 Gone` |

---

## 7. Hướng dẫn thêm feature mới

Ví dụ thêm entity **Product**. Làm theo đúng thứ tự sau:

### Bước 1 — Domain layer

```
src/domain/entities/product.entity.ts
src/domain/repositories/product.repository.interface.ts
src/domain/exceptions/product.exception.ts
```

Checklist:
- [ ] Entity là pure class, không import NestJS
- [ ] Có method business logic nếu cần (`isAvailable()`, `applyDiscount()`)
- [ ] Repository interface chỉ chứa method signatures
- [ ] Injection token dùng `Symbol`

### Bước 2 — Application layer

```
src/application/dtos/create-product.dto.ts
src/application/dtos/update-product.dto.ts
src/application/dtos/query-product.dto.ts
src/application/dtos/product-response.dto.ts
src/application/mappers/product.mapper.ts
src/application/use-cases/create-product.use-case.ts
src/application/use-cases/find-all-products.use-case.ts
src/application/use-cases/find-product-by-id.use-case.ts
src/application/use-cases/update-product.use-case.ts
src/application/use-cases/delete-product.use-case.ts
```

Checklist:
- [ ] DTO dùng `class-validator` decorators
- [ ] Response DTO **không** expose field nhạy cảm
- [ ] Mỗi use-case chỉ làm **một việc**
- [ ] Use-case `@Inject` bằng Symbol token
- [ ] List use-case trả về `{ data, total, page, limit }`
- [ ] Thêm use-cases vào `application.module.ts`

### Bước 3 — Infrastructure layer

```
src/infrastructure/database/schemas/product.schema.ts
src/infrastructure/repositories/product.repository.impl.ts
```

Checklist:
- [ ] Schema class dùng `@Schema({ timestamps: true, versionKey: false })`
- [ ] Impl implement đúng interface từ domain
- [ ] Mọi query đều filter `{ deletedAt: null }` (soft delete)
- [ ] Dùng `.lean()` khi không cần Mongoose Document methods
- [ ] `toEntity()` private method để map Document → Entity
- [ ] Validate `Types.ObjectId.isValid(id)` trước khi query
- [ ] Đăng ký `{ provide: PRODUCT_REPOSITORY, useClass: ProductRepositoryImpl }` trong `infrastructure.module.ts`

### Bước 4 — Presentation layer

```
src/presentation/controllers/product.controller.ts
```

Checklist:
- [ ] Controller chỉ gọi use-case, **không** có business logic
- [ ] Mỗi endpoint có `@ResponseMessage()`
- [ ] `DELETE` dùng `@HttpCode(HttpStatus.NO_CONTENT)`
- [ ] Thêm controller vào `presentation.module.ts`

### Bước 5 — Exception filter (nếu cần)

Thêm entry vào `DomainExceptionFilter`:

```typescript
private readonly statusMap = new Map<string, HttpStatus>([
  ['UserNotFoundException', HttpStatus.NOT_FOUND],
  ['ProductNotFoundException', HttpStatus.NOT_FOUND],   // ← thêm vào đây
]);
```

---

## 8. Các pattern quan trọng

### Soft delete — không bao giờ xóa thật

```typescript
// ✅ Đúng — set deletedAt timestamp
await this.model.findOneAndUpdate(
  { _id: id, deletedAt: null },
  { $set: { deletedAt: new Date() } },
);

// ❌ Sai — xóa khỏi database
await this.model.deleteOne({ _id: id });
```

Mọi query **phải** có `deletedAt: null` trong filter:

```typescript
// ✅ Đúng
this.model.find({ deletedAt: null })

// ❌ Sai — có thể trả về record đã xóa
this.model.find({})
```

### Immutable Entity

Entity không được mutate trực tiếp — mọi thay đổi trả về instance mới:

```typescript
// ✅ Đúng
const updatedUser = user.update({ name: 'New Name' });

// ❌ Sai
user.name = 'New Name';
```

### Pagination — use-case trả về đúng shape để interceptor detect

```typescript
// ✅ Đúng — interceptor tự wrap pagination
return {
  data: UserMapper.toResponseList(result.data),
  total: result.total,
  page,
  limit,
};

// ❌ Sai — wrap thủ công trong controller
return { users: result, pagination: { ... } };
```

### Dependency Injection — dùng Symbol, không dùng string

```typescript
// ✅ Đúng
@Inject(USER_REPOSITORY)
private readonly userRepository: IUserRepository

// ❌ Sai
@Inject('USER_REPOSITORY')
private readonly userRepository: IUserRepository
```

### Error handling — throw domain exception trong use-case

```typescript
// ✅ Đúng — throw trong use-case, filter bắt tự động
async execute(id: string) {
  const user = await this.userRepository.findById(id);
  if (!user) throw new UserNotFoundException(id);
  ...
}

// ❌ Sai — throw HttpException trong use-case (vi phạm dependency rule)
import { NotFoundException } from '@nestjs/common';
if (!user) throw new NotFoundException('User not found');
```

---

## 9. Môi trường và cấu hình

### File `.env`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/myapp

# App
NODE_ENV=development
PORT=3000
```

> Tất cả biến môi trường **phải** được khai báo trong `src/shared/config/env.validation.ts`. App sẽ crash ngay khi khởi động nếu thiếu biến bắt buộc — tốt hơn là crash lúc runtime.

### Thêm biến môi trường mới

1. Thêm vào `.env` và `.env.example`
2. Khai báo trong `env.validation.ts`:

```typescript
class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  MONGODB_URI: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;  // ← thêm vào đây
}
```

3. Dùng trong code qua `ConfigService`:

```typescript
constructor(private readonly config: ConfigService) {}

const secret = this.config.getOrThrow<string>('JWT_SECRET');
```

---

## Tóm tắt checklist trước khi tạo PR

- [ ] File đặt đúng layer, đúng tên theo convention
- [ ] Domain entity không import NestJS hoặc Mongoose
- [ ] Use-case không import từ Infrastructure
- [ ] Mọi query có `deletedAt: null`
- [ ] Response DTO không expose `passwordHash` hoặc field nhạy cảm
- [ ] List endpoint trả về `{ data, total, page, limit }` để interceptor xử lý pagination
- [ ] Exception mới được đăng ký trong `DomainExceptionFilter`
- [ ] Biến môi trường mới được khai báo trong `env.validation.ts`
- [ ] Controller endpoint có `@ResponseMessage()`