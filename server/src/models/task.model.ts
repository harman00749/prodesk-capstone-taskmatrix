import { Schema, model } from "mongoose";

const subtaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    completed: { type: Boolean, default: false },
  },
  { _id: true },
);

const taskSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2_000, default: "" },
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    assigneeName: { type: String, trim: true, maxlength: 80, default: "Unassigned" },
    dueDate: { type: Date, default: null, index: true },
    subtasks: { type: [subtaskSchema], default: [] },
  },
  { timestamps: true, versionKey: "version" },
);

taskSchema.index({ projectId: 1, status: 1, createdAt: -1 });

export const Task = model("Task", taskSchema);
