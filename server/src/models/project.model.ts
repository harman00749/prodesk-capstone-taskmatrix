import { Schema, model } from "mongoose";

const projectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    key: { type: String, required: true, uppercase: true, trim: true, minlength: 2, maxlength: 10 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: "version" },
);

projectSchema.index({ key: 1 }, { unique: true });

export const Project = model("Project", projectSchema);
