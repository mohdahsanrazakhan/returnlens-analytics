import { Schema, model, models, type InferSchemaType } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    company: { type: String, required: true, trim: true, maxlength: 150 },
    role: { type: String, enum: ["admin", "viewer"], default: "admin" },
  },
  { timestamps: true, strict: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema);
