import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PasswordResetTokenDocument = HydratedDocument<PasswordResetTokenSchemaClass>;

@Schema({
  collection: 'password_reset_tokens',
  timestamps: true,
  versionKey: false,
})
export class PasswordResetTokenSchemaClass {
  @Prop({ required: true, index: true })
  tokenHash!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'users', index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  expiresAt!: Date;

  createdAt!: Date;
}

export const PasswordResetTokenSchema = SchemaFactory.createForClass(
  PasswordResetTokenSchemaClass,
);

// TTL index — MongoDB tự xóa document sau khi expiresAt
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetTokenSchema.index({ tokenHash: 1 }, { unique: true });
PasswordResetTokenSchema.index({ userId: 1 });
