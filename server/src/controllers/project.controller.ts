import type { NextFunction, Request, Response } from "express";
import { Project } from "../models/project.model.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/responses.js";

export async function listProjects(_request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await Project.find({ archivedAt: null }).sort({ updatedAt: -1 }).lean();
    sendSuccess(response, 200, projects);
  } catch (error) {
    next(error);
  }
}

export async function createProject(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.create(request.body);
    sendSuccess(response, 201, project, "Project created successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getProject(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findOne({ _id: request.params.id, archivedAt: null }).lean();
    if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found.");
    sendSuccess(response, 200, project);
  } catch (error) {
    next(error);
  }
}

export async function updateProject(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: request.params.id, archivedAt: null },
      { $set: request.body },
      { new: true, runValidators: true },
    );
    if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found.");
    sendSuccess(response, 200, project, "Project updated successfully.");
  } catch (error) {
    next(error);
  }
}

export async function archiveProject(request: Request, response: Response, next: NextFunction): Promise<void> {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: request.params.id, archivedAt: null },
      { $set: { archivedAt: new Date() } },
      { new: true },
    );
    if (!project) throw new AppError(404, "PROJECT_NOT_FOUND", "Project was not found.");

    sendSuccess(response, 200, { id: project._id }, "Project archived successfully.");
  } catch (error) {
    next(error);
  }
}
