import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IPasswordResetTokenRepository,
} from '../../domain/repositories/password-reset-token.repository.interface';
import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';
import {
  PasswordResetTokenSchemaClass,
  PasswordResetTokenDocument,
} from '../database/schemas/password-reset-token.schema';

@Injectable()
export class PasswordResetTokenRepositoryImpl implements IPasswordResetTokenRepository {
  constructor(
    @InjectModel(PasswordResetTokenSchemaClass.name)
    private readonly model: Model<PasswordResetTokenDocument>,
  ) {}

  private toEntity(doc: PasswordResetTokenDocument): PasswordResetToken {
    return new PasswordResetToken(
      doc._id.toString(),
      doc.tokenHash,
      doc.userId.toString(),
      doc.expiresAt,
      doc.createdAt,
    );
  }

  async create(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    const doc = await this.model.create({
      tokenHash: data.tokenHash,
      userId: new Types.ObjectId(data.userId),
      expiresAt: data.expiresAt,
    });
    return this.toEntity(doc);
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    const doc = await this.model
      .findOne({ tokenHash })
      .lean<PasswordResetTokenDocument>()
      .exec();
    return doc ? this.toEntity(doc as unknown as PasswordResetTokenDocument) : null;
  }

  async findByUserId(userId: string): Promise<PasswordResetToken | null> {
    const doc = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .lean<PasswordResetTokenDocument>()
      .exec();
    return doc ? this.toEntity(doc as unknown as PasswordResetTokenDocument) : null;
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.model
      .deleteMany({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  async deleteExpired(): Promise<void> {
    await this.model
      .deleteMany({ expiresAt: { $lt: new Date() } })
      .exec();
  }
}
