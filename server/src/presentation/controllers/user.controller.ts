import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth, ApiOperation, ApiParam, ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../../application/user/dtos/create-user.dto';
import { UpdateUserDto } from '../../application/user/dtos/update-user.dto';
import { QueryUserDto } from '../../application/user/dtos/query-user.dto';
import { ResponseMessage } from '../../shared/decorators/response-message.decorator';
import { CreateUserUseCase } from '@/application/user/use-cases/create-user.use-case';
import { FindAllUsersUseCase } from '@/application/user/use-cases/find-all-users.use-case';
import { UpdateUserUseCase } from '@/application/user/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '@/application/user/use-cases/delete-user.use-case';
import { FindUserByIdUseCase } from '@/application/user/use-cases/find-user-by-id.use-case';
import { ApiErrorResponse, ApiPaginatedResponse, ApiSuccessResponse } from '@/shared/swagger/api-response.swagger';
import { UserResponseDto } from '@/application/user/dtos/user-response.dto';
import { Public } from '../decorators/public.decorator';
@ApiTags('Users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @ResponseMessage('User created successfully')
  @ApiOperation({ summary: 'Tạo user mới' })
  @ApiSuccessResponse(UserResponseDto, 201, 'User created')
  @ApiErrorResponse(409, 'Email đã tồn tại', 'UserAlreadyExistsException', 'User with email "x@x.com" already exists')
  @ApiErrorResponse(400, 'Validation lỗi', 'BadRequestException', 'email must be an email')
  create(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  @ResponseMessage('Users retrieved successfully')
  @ApiOperation({ summary: 'Lấy danh sách users có phân trang' })
  @ApiPaginatedResponse(UserResponseDto, 'Danh sách users')
  findAll(@Query() query: QueryUserDto) {
    return this.findAllUsersUseCase.execute(query);
  }

  @Get(':id')
  @ResponseMessage('User retrieved successfully')
  @ApiOperation({ summary: 'Lấy thông tin 1 user theo id' })
  @ApiParam({ name: 'id', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiSuccessResponse(UserResponseDto, 200, 'User retrieved')
  @ApiErrorResponse(404, 'Không tìm thấy', 'UserNotFoundException', 'User with id "..." not found')
  findOne(@Param('id') id: string) {
    return this.findUserByIdUseCase.execute(id);
  }

  @Patch(':id')
  @ResponseMessage('User updated successfully')
  @ApiOperation({ summary: 'Cập nhật thông tin user' })
  @ApiParam({ name: 'id', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiSuccessResponse(UserResponseDto, 200, 'User updated')
  @ApiErrorResponse(404, 'Không tìm thấy', 'UserNotFoundException', 'User with id "..." not found')
  @ApiErrorResponse(409, 'Email đã tồn tại', 'UserAlreadyExistsException', 'User with email "x@x.com" already exists')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ResponseMessage('User deleted successfully')
  @ApiOperation({ summary: 'Xóa mềm user' })
  @ApiParam({ name: 'id', example: '64f1a2b3c4d5e6f7a8b9c0d1' })
  @ApiErrorResponse(404, 'Không tìm thấy', 'UserNotFoundException', 'User with id "..." not found')
  @ApiErrorResponse(410, 'Đã bị xóa', 'UserDeletedException', 'User with id "..." has been deleted')
  remove(@Param('id') id: string) {
    return this.deleteUserUseCase.execute(id);
  }
}