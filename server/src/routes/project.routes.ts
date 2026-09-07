import { Router } from "express";
import {
  archiveProject,
  createProject,
  getProject,
  listProjects,
  updateProject,
} from "../controllers/project.controller.js";
import { createTask, listTasks } from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.js";
import { idParamsSchema, projectIdParamsSchema } from "../schemas/common.schema.js";
import { createProjectSchema, updateProjectSchema } from "../schemas/project.schema.js";
import { createTaskSchema, taskQuerySchema } from "../schemas/task.schema.js";

export const projectRouter = Router();

projectRouter.route("/").get(listProjects).post(validate({ body: createProjectSchema }), createProject);

projectRouter
  .route("/:id")
  .get(validate({ params: idParamsSchema }), getProject)
  .patch(validate({ params: idParamsSchema, body: updateProjectSchema }), updateProject)
  .delete(validate({ params: idParamsSchema }), archiveProject);

projectRouter
  .route("/:projectId/tasks")
  .get(validate({ params: projectIdParamsSchema, query: taskQuerySchema }), listTasks)
  .post(validate({ params: projectIdParamsSchema, body: createTaskSchema }), createTask);
