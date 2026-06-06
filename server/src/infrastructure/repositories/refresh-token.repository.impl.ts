import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  IRefreshTokenRepository,
} from '../../domain/repositories/refresh-token.repository.interface';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import {
  RefreshTokenSchemaClass,
  RefreshTokenDocument,
} from '../database/schemas/refresh-token.schema';

@Injectable()
export class RefreshTokenRepositoryImpl implements IRefreshTokenRepository {
  constructor(
    @InjectModel(RefreshTokenSchemaClass.name)
    private readonly model: Model<RefreshTokenDocument>,
  ) {}

  private toEntity(doc: RefreshTokenDocument): RefreshToken {
    return new RefreshToken(
      doc._id.toString(),
      doc.tokenHash,
      doc.userId.toString(),
      doc.expiresAt,
      doc.isRevoked,
      doc.createdAt,
    );
  }

  async create(data: {
    tokenHash: string;
    userId: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    const doc = await this.model.create({
      tokenHash: data.tokenHash,
      userId: new Types.ObjectId(data.userId),
      expiresAt: data.expiresAt,
      isRevoked: false,
    });
    return this.toEntity(doc);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const doc = await this.model
      .findOne({ tokenHash, isRevoked: false })
      .lean<RefreshTokenDocument>()
      .exec();
    return doc ? this.toEntity(doc as unknown as RefreshTokenDocument) : null;
  }

  async revokeByTokenHash(tokenHash: string): Promise<void> {
    await this.model
      .updateOne({ tokenHash }, { $set: { isRevoked: true } })
      .exec();
  }

  async revokeAllByUserId(userId: string): Promise<void> {
    await this.model
      .updateMany(
        { userId: new Types.ObjectId(userId), isRevoked: false },
        { $set: { isRevoked: true } },
      )
      .exec();
  }

  async deleteExpired(): Promise<void> {
    await this.model
      .deleteMany({ expiresAt: { $lt: new Date() } })
      .exec();
  }
}