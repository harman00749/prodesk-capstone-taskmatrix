import { Router } from "express";
import { deleteTask, getTask, updateTask } from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.js";
import { taskIdParamsSchema } from "../schemas/common.schema.js";
import { updateTaskSchema } from "../schemas/task.schema.js";

export const taskRouter = Router();

taskRouter
  .route("/:taskId")
  .get(validate({ params: taskIdParamsSchema }), getTask)
  .patch(validate({ params: taskIdParamsSchema, body: updateTaskSchema }), updateTask)
  .delete(validate({ params: taskIdParamsSchema }), deleteTask);
