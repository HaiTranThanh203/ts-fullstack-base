import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IUserRepository,
  FindAllOptions,
} from '../../domain/repositories/user.repository.interface';
import { User, UserRole } from '../../domain/entities/user.entity';
import { UserSchemaClass, UserDocument } from '../database/schemas/user.schema';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ─── Mapper ───────────────────────────────────────────────────────────────

  private toEntity(doc: UserDocument): User {
    return new User(
      doc._id.toString(),
      doc.name,
      doc.email,
      doc.passwordHash,
      doc.role as UserRole,
      doc.createdAt,
      doc.updatedAt,
      doc.deletedAt ?? null,
    );
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.userModel
      .findOne({ _id: id, deletedAt: null })
      .lean<UserDocument>()
      .exec();

    return doc ? this.toEntity(doc as unknown as UserDocument) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.userModel
      .findOne({ email: email.toLowerCase(), deletedAt: null })
      .lean<UserDocument>()
      .exec();

    return doc ? this.toEntity(doc as unknown as UserDocument) : null;
  }

  async findAll(
    options: FindAllOptions = {},
  ): Promise<{ data: User[]; total: number }> {
    const { page = 1, limit = 10, role } = options;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { deletedAt: null };
    if (role) filter.role = role;

    const [docs, total] = await Promise.all([
      this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .lean<UserDocument[]>()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data: (docs as unknown as UserDocument[]).map((d) => this.toEntity(d)),
      total,
    };
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({ email: email.toLowerCase(), deletedAt: null })
      .exec();
    return count > 0;
  }

  // ─── Commands ─────────────────────────────────────────────────────────────

  async create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'isDeleted' | 'isAdmin' | 'update' | 'softDelete'>,
  ): Promise<User> {
    const created = await this.userModel.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role,
    });

    return this.toEntity(created);
  }

  async update(
    id: string,
    data: Partial<Pick<User, 'name' | 'email'>>,
  ): Promise<User | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const doc = await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: data },
        { new: true },   // trả về document sau khi update
      )
      .lean<UserDocument>()
      .exec();

    return doc ? this.toEntity(doc as unknown as UserDocument) : null;
  }

  async softDelete(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;

    await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { deletedAt: new Date() } },
      )
      .exec();
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;

    await this.userModel
      .findOneAndUpdate(
        { _id: id, deletedAt: null },
        { $set: { passwordHash } },
      )
      .exec();
  }
}