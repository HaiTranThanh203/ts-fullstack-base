# Project Architecture

> NestJS + MongoDB — Clean Architecture  
> Tài liệu này dành cho developer mới onboard. Đọc kỹ trước khi bắt đầu implement feature mới.

---

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Quy tắc đặt tên](#3-quy-tắc-đặt-tên)
4. [Dependency Rule](#4-dependency-rule)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [Luồng xử lý request](#6-luồng-xử-lý-request)
7. [Response format chuẩn](#7-response-format-chuẩn)
8. [Hướng dẫn thêm feature mới](#8-hướng-dẫn-thêm-feature-mới)
9. [Các pattern quan trọng](#9-các-pattern-quan-trọng)
10. [Môi trường và cấu hình](#10-môi-trường-và-cấu-hình)
11. [Docker & Database](#11-docker--database)
12. [Checklist trước khi tạo PR](#12-checklist-trước-khi-tạo-pr)

---

## 1. Tổng quan kiến trúc

Dự án áp dụng **Clean Architecture** chia thành 4 layer độc lập:

```
┌──────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│       Controllers · Guards · Strategies · Pipes      │
├──────────────────────────────────────────────────────┤
│                  Application Layer                   │
│     Use-cases · DTOs · Mappers (chia theo domain)    │
├──────────────────────────────────────────────────────┤
│                    Domain Layer                      │
│        Entities · Repository Interfaces · Exceptions │
├──────────────────────────────────────────────────────┤
│                 Infrastructure Layer                 │
│      Mongoose Schemas · Repository Impls · Config    │
└──────────────────────────────────────────────────────┘
```

| Layer | Trách nhiệm | Được phép import |
|---|---|---|
| **Domain** | Nghiệp vụ cốt lõi, pure TypeScript | Không import gì ngoài TypeScript built-in |
| **Application** | Điều phối use-cases, chia theo business domain | Domain layer, `@nestjs/jwt`, `@nestjs/config` |
| **Infrastructure** | Chi tiết kỹ thuật (DB, cache, email...) | Domain layer, thư viện bên ngoài |
| **Presentation** | Giao tiếp HTTP, bảo vệ route | Application layer, Passport |

---

## 2. Cấu trúc thư mục

```
src/
│
├── domain/                                    # Layer 1 — Lõi nghiệp vụ
│   ├── entities/
│   │   ├── user.entity.ts                     # Pure class, không import NestJS/Mongoose
│   │   └── refresh-token.entity.ts
│   ├── repositories/
│   │   ├── user.repository.interface.ts       # Interface + Symbol injection token
│   │   └── refresh-token.repository.interface.ts
│   └── exceptions/
│       ├── user.exception.ts                  # Domain-specific errors
│       └── auth.exception.ts
│
├── application/                               # Layer 2 — Use-cases chia theo business domain
│   ├── user/                                  # ← Business domain: User
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   ├── query-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   ├── mappers/
│   │   │   └── user.mapper.ts
│   │   └── use-cases/
│   │       ├── create-user.use-case.ts
│   │       ├── find-all-users.use-case.ts
│   │       ├── find-user-by-id.use-case.ts
│   │       ├── update-user.use-case.ts
│   │       └── delete-user.use-case.ts
│   │
│   ├── auth/                                  # ← Business domain: Auth
│   │   ├── dtos/
│   │   │   ├── login.dto.ts
│   │   │   ├── auth-response.dto.ts
│   │   │   └── refresh-token.dto.ts
│   │   └── use-cases/
│   │       ├── login.use-case.ts
│   │       ├── refresh-token.use-case.ts
│   │       └── logout.use-case.ts
│   │
│   └── application.module.ts
│
├── infrastructure/                            # Layer 3 — Triển khai kỹ thuật
│   ├── database/
│   │   └── schemas/
│   │       ├── user.schema.ts                 # Mongoose @Schema class
│   │       └── refresh-token.schema.ts        # TTL index tự xóa token hết hạn
│   ├── repositories/
│   │   ├── user.repository.impl.ts
│   │   └── refresh-token.repository.impl.ts
│   └── infrastructure.module.ts
│
├── presentation/                              # Layer 4 — HTTP interface
│   ├── controllers/
│   │   ├── user.controller.ts
│   │   └── auth.controller.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts                    # Passport JWT strategy
│   ├── guards/
│   │   ├── jwt-auth.guard.ts                  # Bảo vệ route, đọc @Public()
│   │   └── roles.guard.ts                     # Kiểm tra role, đọc @Roles()
│   ├── decorators/
│   │   ├── public.decorator.ts                # @Public() — bỏ qua JWT
│   │   ├── current-user.decorator.ts          # @CurrentUser() — lấy user từ token
│   │   └── roles.decorator.ts                 # @Roles(UserRole.ADMIN)
│   └── presentation.module.ts
│
├── shared/                                    # Dùng chung, không thuộc layer nào
│   ├── config/
│   │   └── env.validation.ts                  # Validate toàn bộ biến môi trường lúc boot
│   ├── decorators/
│   │   └── response-message.decorator.ts      # @ResponseMessage('...')
│   ├── filters/
│   │   ├── domain-exception.filter.ts         # Map domain error → HTTP status
│   │   └── http-exception.filter.ts           # Map NestJS HttpException → chuẩn response
│   ├── interceptors/
│   │   └── response.interceptor.ts            # Wrap mọi response về cùng shape
│   └── response/
│       └── api-response.dto.ts                # ApiResponseDto + PaginationMeta
│
├── app.module.ts                              # Root module
└── main.ts                                    # Bootstrap — global filters, interceptor, pipe
```

### Quy tắc tổ chức Application layer

Application layer được chia theo **business domain** (không phải theo loại file):

```
application/
├── user/        # tất cả DTOs, mappers, use-cases liên quan đến User
├── auth/        # tất cả DTOs, use-cases liên quan đến Auth
├── product/     # thêm domain mới → thêm folder mới, không đụng folder khác
└── order/
```

> **Quy tắc vàng:** Xóa một domain → xóa đúng một folder. Không có file nào bị "mồ côi".

---

## 3. Quy tắc đặt tên

### File — tất cả dùng kebab-case

| Loại | Pattern | Ví dụ |
|---|---|---|
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Repository interface | `{name}.repository.interface.ts` | `user.repository.interface.ts` |
| Repository impl | `{name}.repository.impl.ts` | `user.repository.impl.ts` |
| Mongoose schema | `{name}.schema.ts` | `user.schema.ts` |
| Use-case | `{action}-{name}.use-case.ts` | `create-user.use-case.ts` |
| DTO input | `{action}-{name}.dto.ts` | `create-user.dto.ts` |
| DTO response | `{name}-response.dto.ts` | `user-response.dto.ts` |
| Mapper | `{name}.mapper.ts` | `user.mapper.ts` |
| Controller | `{name}.controller.ts` | `user.controller.ts` |
| Module | `{name}.module.ts` | `application.module.ts` |
| Filter | `{name}.filter.ts` | `domain-exception.filter.ts` |
| Interceptor | `{name}.interceptor.ts` | `response.interceptor.ts` |
| Decorator | `{name}.decorator.ts` | `current-user.decorator.ts` |
| Guard | `{name}.guard.ts` | `jwt-auth.guard.ts` |
| Strategy | `{name}.strategy.ts` | `jwt.strategy.ts` |

### Class — PascalCase

| Loại | Pattern | Ví dụ |
|---|---|---|
| Entity | `PascalCase` | `User`, `RefreshToken` |
| Use-case | `{Action}{Name}UseCase` | `CreateUserUseCase` |
| Repository interface | `I{Name}Repository` | `IUserRepository` |
| Repository impl | `{Name}RepositoryImpl` | `UserRepositoryImpl` |
| Mongoose schema class | `{Name}SchemaClass` | `UserSchemaClass` |
| DTO input | `{Action}{Name}Dto` | `CreateUserDto` |
| DTO response | `{Name}ResponseDto` | `UserResponseDto` |
| Mapper | `{Name}Mapper` | `UserMapper` |
| Controller | `{Name}Controller` | `AuthController` |
| Exception | `{Description}Exception` | `UserNotFoundException` |
| Guard | `{Name}Guard` | `JwtAuthGuard` |
| Strategy | `{Name}Strategy` | `JwtStrategy` |
| Enum | `PascalCase` | `UserRole` |

### Biến, hàm, hằng số

| Loại | Pattern | Ví dụ |
|---|---|---|
| Biến thường | `camelCase` | `userId`, `totalPages` |
| Hàm / method | `camelCase`, động từ đứng đầu | `findById()`, `toResponse()` |
| Hằng số | `SCREAMING_SNAKE_CASE` | `MAX_RETRY` |
| Injection token (Symbol) | `SCREAMING_SNAKE_CASE` | `USER_REPOSITORY` |
| Biến môi trường | `SCREAMING_SNAKE_CASE` | `JWT_ACCESS_SECRET` |
| Enum value | `SCREAMING_SNAKE_CASE` | `UserRole.ADMIN` |
| Boolean | prefix `is`, `has`, `can` | `isDeleted()`, `isValid()` |
| Required class field | suffix `!` (non-null assertion) | `email!: string` |

### Required fields trong DTO và Schema

```typescript
// ✅ Đúng — dùng ! để tránh TypeScript lỗi "not definitely assigned"
export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

// ❌ Sai — TypeScript báo lỗi hoặc phải dùng strict: false
export class CreateUserDto {
  @IsEmail()
  email: string;
}
```

### Injection Token

```typescript
// ✅ Dùng Symbol — đặt trong cùng file với interface
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
// ✅ Application import Domain
import { User } from '../../domain/entities/user.entity';

// ✅ Infrastructure implement interface từ Domain
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

// ✅ Application import trong cùng domain
import { UserMapper } from '../mappers/user.mapper';

// ✅ Application cross-domain (auth dùng user mapper)
import { UserMapper } from '../../user/mappers/user.mapper';

// ❌ Domain KHÔNG được import NestJS
import { Injectable } from '@nestjs/common';

// ❌ Application KHÔNG được biết Infrastructure
import { UserSchemaClass } from '../../infrastructure/database/schemas/user.schema';

// ❌ Domain KHÔNG được import Application
import { CreateUserDto } from '../../application/user/dtos/create-user.dto';
```

---

## 5. Authentication & Authorization

### Cơ chế JWT

Dự án dùng **Access Token + Refresh Token** với **Token Rotation**:

| Token | Thời hạn | Lưu ở đâu | Mục đích |
|---|---|---|---|
| Access Token | 15 phút | Client (memory/header) | Xác thực mọi request |
| Refresh Token | 7 ngày | Client + MongoDB | Cấp access token mới |

**Token Rotation:** Mỗi lần gọi `/auth/refresh`, refresh token cũ bị revoke ngay lập tức và cấp cặp token mới. Nếu kẻ tấn công dùng token cũ, hệ thống phát hiện được.

**Lưu hash:** Refresh token được hash bằng SHA-256 trước khi lưu DB — nếu DB bị lộ, token không dùng được.

### Bảo vệ route

Mặc định **tất cả route đều cần JWT**. Dùng `@Public()` để mở route không cần auth:

```typescript
// ✅ Route cần JWT (mặc định)
@Get('profile')
getProfile(@CurrentUser() user: User) { ... }

// ✅ Route không cần JWT
@Post('login')
@Public()
login(@Body() dto: LoginDto) { ... }

// ✅ Route cần JWT + role cụ thể
@Get()
@Roles(UserRole.ADMIN)
findAll() { ... }
```

### Lấy thông tin user hiện tại

```typescript
// Trong controller — dùng @CurrentUser() decorator
@Get('me')
me(@CurrentUser() user: User) {
  return UserMapper.toResponse(user);
}

// user là domain Entity, không phải Mongoose Document
// user.id, user.email, user.role, user.isAdmin() đều dùng được
```

### Auth endpoints

| Endpoint | Method | Auth | Mô tả |
|---|---|---|---|
| `/auth/login` | POST | Public | Đăng nhập, nhận cặp token |
| `/auth/refresh` | POST | Public | Đổi refresh token lấy cặp token mới |
| `/auth/logout` | POST | JWT | Revoke refresh token hiện tại |
| `/auth/logout-all` | POST | JWT | Revoke tất cả refresh token của user |
| `/auth/me` | GET | JWT | Lấy thông tin user đang đăng nhập |

---

## 6. Luồng xử lý request

### Happy path — request thông thường

```
HTTP Request
    │
    ▼
[JwtAuthGuard]            — verify Bearer token, bỏ qua nếu @Public()
    │
    ▼
[RolesGuard]              — kiểm tra role nếu có @Roles()
    │
    ▼
[ValidationPipe]          — class-validator kiểm tra DTO, strip field lạ
    │
    ▼
[Controller]              — gọi đúng use-case, không có business logic
    │
    ▼
[Use-case]                — business logic, gọi IRepository qua Symbol token
    │
    ▼
[RepositoryImpl]          — Mongoose query, map Document → Domain Entity
    │
    ▼
[MongoDB]
    │
    ▼ (kết quả trả ngược lên)
[Use-case]                — map Entity → ResponseDto qua Mapper
    │
    ▼
[ResponseInterceptor]     — tự detect paginated hay single, wrap ApiResponseDto
    │
    ▼
HTTP Response
```

### Error path

```
Use-case throw UserNotFoundException / InvalidCredentialsException
    │
    ▼
[DomainExceptionFilter]   — map tên exception → HTTP status code
    │
    ▼
{ success: false, statusCode: 404, message: "...", error: "UserNotFoundException" }
```

```
ValidationPipe / JwtAuthGuard throw HttpException
    │
    ▼
[HttpExceptionFilter]     — chuẩn hóa message (gộp mảng validation errors)
    │
    ▼
{ success: false, statusCode: 400, message: "email must be an email", error: "BadRequestException" }
```

---

## 7. Response format chuẩn

Mọi API đều trả về cùng shape. **Không bao giờ** trả raw object từ controller.

### Single object

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

### Danh sách có phân trang

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

> **Cơ chế tự động:** Use-case trả về `{ data, total, page, limit }` → `ResponseInterceptor` tự thêm `pagination`. Không cần xử lý thủ công trong controller.

### Lỗi

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Email or password is incorrect",
  "error": "InvalidCredentialsException"
}
```

### HTTP status code chuẩn

| Action | Status |
|---|---|
| `POST` tạo thành công | `201 Created` |
| `GET`, `PATCH`, `POST` action thành công | `200 OK` |
| `DELETE`, `POST logout` thành công | `204 No Content` |
| Validation lỗi | `400 Bad Request` |
| Sai credentials / token hết hạn | `401 Unauthorized` |
| Không đủ quyền (role) | `403 Forbidden` |
| Không tìm thấy | `404 Not Found` |
| Trùng dữ liệu | `409 Conflict` |
| Đã bị xóa mềm | `410 Gone` |

---

## 8. Hướng dẫn thêm feature mới

Ví dụ thêm domain **Product**. Làm đúng thứ tự 5 bước sau:

---

### Bước 1 — Domain layer

Tạo 3 file:

```
src/domain/entities/product.entity.ts
src/domain/repositories/product.repository.interface.ts
src/domain/exceptions/product.exception.ts
```

**Checklist:**
- [ ] Entity là pure class — không `import` bất cứ thứ gì từ NestJS hay Mongoose
- [ ] Các field required dùng `!` (non-null assertion)
- [ ] Có method business logic nếu cần: `isAvailable()`, `applyDiscount()`
- [ ] Entity có method `softDelete()` trả về instance mới (immutable)
- [ ] Repository interface chỉ chứa method signatures, không có implementation
- [ ] Injection token dùng `Symbol`: `export const PRODUCT_REPOSITORY = Symbol('IProductRepository')`
- [ ] Exception class kế thừa `Error`, set `this.name` trong constructor

```typescript
// Ví dụ nhanh
export class ProductNotFoundException extends Error {
  constructor(id: string) {
    super(`Product with id "${id}" not found`);
    this.name = 'ProductNotFoundException';
  }
}
```

---

### Bước 2 — Application layer

Tạo folder `src/application/product/` với cấu trúc:

```
src/application/product/
├── dtos/
│   ├── create-product.dto.ts
│   ├── update-product.dto.ts
│   ├── query-product.dto.ts
│   └── product-response.dto.ts
├── mappers/
│   └── product.mapper.ts
└── use-cases/
    ├── create-product.use-case.ts
    ├── find-all-products.use-case.ts
    ├── find-product-by-id.use-case.ts
    ├── update-product.use-case.ts
    └── delete-product.use-case.ts
```

**Checklist:**
- [ ] Tất cả field required trong DTO dùng `!`
- [ ] DTO dùng `class-validator` decorators (`@IsString()`, `@IsNotEmpty()`...)
- [ ] Response DTO **không** expose field nhạy cảm (password, token...)
- [ ] Mỗi use-case chỉ làm **một việc duy nhất**
- [ ] Use-case inject repository bằng `@Inject(PRODUCT_REPOSITORY)`
- [ ] Find-all use-case trả về `{ data, total, page, limit }` để interceptor tự xử lý pagination
- [ ] Đăng ký use-cases vào `application.module.ts`

```typescript
// application.module.ts — thêm vào providers và exports
const PRODUCT_USE_CASES = [
  CreateProductUseCase,
  FindAllProductsUseCase,
  FindProductByIdUseCase,
  UpdateProductUseCase,
  DeleteProductUseCase,
];
```

---

### Bước 3 — Infrastructure layer

Tạo 2 file:

```
src/infrastructure/database/schemas/product.schema.ts
src/infrastructure/repositories/product.repository.impl.ts
```

**Checklist:**
- [ ] Schema dùng `@Schema({ timestamps: true, versionKey: false })`
- [ ] Các `@Prop` required dùng `!` trên field declaration
- [ ] Thêm TTL index nếu cần tự xóa document
- [ ] Repository impl implement đúng interface từ domain
- [ ] Mọi query đều filter `{ deletedAt: null }` (soft delete)
- [ ] Dùng `.lean()` cho query đọc — nhanh hơn và trả về plain object
- [ ] Có private method `toEntity(doc)` map Document → Entity
- [ ] Validate `Types.ObjectId.isValid(id)` trước khi query theo id
- [ ] Đăng ký schema và provider vào `infrastructure.module.ts`:

```typescript
// infrastructure.module.ts
MongooseModule.forFeature([
  { name: ProductSchemaClass.name, schema: ProductSchema }, // ← thêm
]),
providers: [
  { provide: PRODUCT_REPOSITORY, useClass: ProductRepositoryImpl }, // ← thêm
],
exports: [PRODUCT_REPOSITORY], // ← thêm
```

---

### Bước 4 — Presentation layer

Tạo 1 file:

```
src/presentation/controllers/product.controller.ts
```

**Checklist:**
- [ ] Controller chỉ gọi use-case — **không** có business logic, không gọi repository trực tiếp
- [ ] Mỗi endpoint có `@ResponseMessage('...')`
- [ ] `POST` có `@HttpCode(HttpStatus.CREATED)`
- [ ] `DELETE` có `@HttpCode(HttpStatus.NO_CONTENT)`
- [ ] Route cần bảo vệ thì thêm `@Roles(UserRole.ADMIN)` — không cần `@UseGuards` vì guard đã global
- [ ] Route public thì thêm `@Public()`
- [ ] Đăng ký controller vào `presentation.module.ts`

```typescript
// Skeleton nhanh
@Controller('products')
export class ProductController {
  constructor(
    private readonly createProduct: CreateProductUseCase,
    private readonly findAllProducts: FindAllProductsUseCase,
    private readonly findProductById: FindProductByIdUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ResponseMessage('Product created successfully')
  create(@Body() dto: CreateProductDto) {
    return this.createProduct.execute(dto);
  }

  // ... findAll, findOne, update, remove
}
```

---

### Bước 5 — Exception filter

Thêm exception mới vào `DomainExceptionFilter`:

```typescript
// src/shared/filters/domain-exception.filter.ts
@Catch(
  // ... các exception cũ
  ProductNotFoundException,    // ← thêm vào @Catch decorator
)
export class DomainExceptionFilter {
  private readonly statusMap = new Map<string, HttpStatus>([
    // ... các entry cũ
    ['ProductNotFoundException', HttpStatus.NOT_FOUND], // ← thêm vào map
  ]);
}
```

---

## 9. Các pattern quan trọng

### Soft delete — không bao giờ xóa thật

```typescript
// ✅ Đúng — set deletedAt timestamp
await this.model.findOneAndUpdate(
  { _id: id, deletedAt: null },
  { $set: { deletedAt: new Date() } },
);

// ❌ Sai — mất data vĩnh viễn
await this.model.deleteOne({ _id: id });
```

Mọi query đọc **phải** có `deletedAt: null`:

```typescript
// ✅ Đúng
this.model.find({ deletedAt: null, ...otherFilters })

// ❌ Sai — trả về cả record đã xóa
this.model.find({ ...otherFilters })
```

---

### Immutable Entity

Entity không được mutate trực tiếp — mọi thay đổi trả về instance mới:

```typescript
// ✅ Đúng — trả về instance mới
const updated = user.update({ name: 'New Name' });
const deleted = user.softDelete();

// ❌ Sai — mutate trực tiếp
user.name = 'New Name';
user.deletedAt = new Date();
```

---

### Pagination — shape chuẩn để interceptor detect

```typescript
// ✅ Đúng — interceptor tự thêm pagination vào response
async execute(query: QueryProductDto) {
  const result = await this.productRepository.findAll({ ... });
  return {
    data: ProductMapper.toResponseList(result.data),
    total: result.total,
    page: query.page,
    limit: query.limit,
  };
}

// ❌ Sai — wrap thủ công, không nhất quán
return { products: result, meta: { total, page } };
```

---

### Dependency Injection — Symbol token

```typescript
// ✅ Đúng
@Inject(PRODUCT_REPOSITORY)
private readonly productRepository: IProductRepository

// ❌ Sai — string dễ bị typo và conflict
@Inject('PRODUCT_REPOSITORY')
private readonly productRepository: IProductRepository
```

---

### Error handling — throw domain exception trong use-case

```typescript
// ✅ Đúng — throw domain exception, filter bắt tự động
async execute(id: string) {
  const product = await this.productRepository.findById(id);
  if (!product) throw new ProductNotFoundException(id);
}

// ❌ Sai — import NestJS exception vào use-case (vi phạm Dependency Rule)
import { NotFoundException } from '@nestjs/common';
if (!product) throw new NotFoundException();
```

---

### Token Rotation — refresh token

```
Client gọi /auth/refresh với refresh token cũ
    │
    ▼
Tìm tokenHash trong DB — nếu không có hoặc isRevoked=true → 401
    │
    ▼
Revoke token cũ NGAY LẬP TỨC (isRevoked = true)
    │
    ▼
Tạo cặp token mới, lưu refresh token mới vào DB
    │
    ▼
Trả về { accessToken, refreshToken } mới cho client
```

Nếu kẻ tấn công dùng refresh token cũ sau khi đã rotate → DB không tìm thấy → 401 tự động.

---

### Required fields — dùng `!` nhất quán

```typescript
// ✅ Đúng — dùng ! cho tất cả field required trong DTO, Schema, Entity
export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

@Schema()
export class UserSchemaClass {
  @Prop({ required: true })
  email!: string;
}

// ❌ Sai — optional field (?) cho field thực ra là required
export class LoginDto {
  email?: string;
}
```

---

## 10. Môi trường và cấu hình

### File `.env`

```env
# MongoDB
MONGODB_URI=mongodb://myapp_user:myapp_password@localhost:27017/myapp

# App
NODE_ENV=development
PORT=3000

# JWT
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

> App sẽ **crash ngay khi khởi động** nếu thiếu biến bắt buộc — tốt hơn là crash lúc runtime production.

### Thêm biến môi trường mới — 3 bước

**1.** Thêm vào `.env` và `.env.example`:
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
```

**2.** Khai báo trong `src/shared/config/env.validation.ts`:
```typescript
class EnvironmentVariables {
  // ... các biến hiện có

  @IsString()
  @IsNotEmpty()
  MAIL_HOST!: string;

  @IsInt()
  @Min(1)
  MAIL_PORT!: number;
}
```

**3.** Dùng qua `ConfigService` — luôn dùng `getOrThrow` thay vì `get`:
```typescript
const host = this.config.getOrThrow<string>('MAIL_HOST');
const port = this.config.getOrThrow<number>('MAIL_PORT');
```

---

## 11. Docker & Database

### Khởi động môi trường dev

```bash
# Khởi động MongoDB + Mongo Express
npm run docker:up

# Xem log
npm run docker:logs

# Chạy app
npm run start:dev
```

### Mongo Express — UI xem data

Truy cập `http://localhost:8081`

- Username: `admin`
- Password: `admin123`

### Reset database

```bash
# Xóa toàn bộ data và tạo lại
npm run docker:reset
```

### Connection string theo môi trường

| Môi trường | URI |
|---|---|
| Local Docker | `mongodb://myapp_user:myapp_password@localhost:27017/myapp` |
| Production (Atlas) | `mongodb+srv://user:pass@cluster.mongodb.net/myapp` |

---

## 12. Checklist trước khi tạo PR

### Code quality
- [ ] File đặt đúng layer và đúng folder domain trong `application/`
- [ ] Tên file, class, biến theo đúng convention ở mục 3
- [ ] Field required trong DTO và Schema dùng `!`

### Architecture
- [ ] Domain entity không import NestJS hoặc Mongoose
- [ ] Use-case không import từ Infrastructure
- [ ] Controller không có business logic, không gọi repository trực tiếp

### Database
- [ ] Mọi query có `deletedAt: null` trong filter
- [ ] Schema có `{ timestamps: true, versionKey: false }`
- [ ] Repository impl có `toEntity()` private method

### API
- [ ] Response DTO không expose field nhạy cảm (`passwordHash`, raw token...)
- [ ] Find-all use-case trả về `{ data, total, page, limit }`
- [ ] Controller endpoint có `@ResponseMessage()`
- [ ] `POST` tạo mới dùng `@HttpCode(HttpStatus.CREATED)`
- [ ] `DELETE` dùng `@HttpCode(HttpStatus.NO_CONTENT)`

### Auth
- [ ] Route không cần auth có `@Public()`
- [ ] Route cần role có `@Roles(UserRole.ADMIN)`
- [ ] Exception mới được thêm vào `DomainExceptionFilter`

### Config
- [ ] Biến môi trường mới được khai báo trong `env.validation.ts`
- [ ] Biến môi trường mới được thêm vào `.env.example`
- [ ] Dùng `getOrThrow()` thay vì `get()` khi đọc config