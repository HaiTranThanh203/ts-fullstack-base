import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshTokenSchemaClass>;

@Schema({
  collection: 'refresh_tokens',
  timestamps: true,
  versionKey: false,
})
export class RefreshTokenSchemaClass {
  @Prop({ required: true, index: true })
  tokenHash!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ required: true, default: false })
  isRevoked!: boolean;

  createdAt!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(
  RefreshTokenSchemaClass,
);

// TTL index — MongoDB tự xóa document sau khi expiresAt
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });