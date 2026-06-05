import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// HydratedDocument giúp TypeScript hiểu đúng kiểu của Mongoose document
export type UserDocument = HydratedDocument<UserSchemaClass>;

@Schema({
  collection: 'users',
  timestamps: true,      // tự thêm createdAt, updatedAt
  versionKey: false,     // bỏ __v
})
export class UserSchemaClass {
  // Thêm dấu '!' vào tất cả các thuộc tính

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, enum: ['admin', 'user'], default: 'user' })
  role!: string;

  @Prop({ type: Date, default: null })
  deletedAt!: Date | null;

  // timestamps: true tự inject 2 field này nên TypeScript càng cần dấu !
  createdAt!: Date;
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);

// Index để query nhanh
UserSchema.index({ email: 1 });
UserSchema.index({ deletedAt: 1 });