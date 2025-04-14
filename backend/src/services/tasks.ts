import { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { db } from "../db.js";
import { Task } from "../models/item.js";
import { TaskStatus } from "../models/item.js";
import { ItemTask as ItemTask } from "../models/item.js";
import { APIError } from "../routes/items.js";

export async function createTask(serviceName: string, itemId: string, task: ItemTask, req: Request, res: Response, next: NextFunction): Promise<Task | void> {
  await db.read();
  const itemIndex = db.data.items.findIndex((item) => item.id === itemId);

  if (itemIndex === -1) {
    return next(new APIError(404, `Item not found: ${itemId}`));
  }

  if (!task){
    return next(new APIError(400, 'Invalid request. No task specified.'));
  }

  if (!(task in ItemTask)) {
    return next(new APIError(400, `Invalid request. Task ${task} not supported.`));
  }

  const taskId = nanoid();

  const itemTask: Task = {
    id: taskId,
    itemId: itemId,
    status: TaskStatus.PENDING,
    task: task,
    monitorUrl: `${req.protocol}://${req.hostname}/services/tasks/${serviceName}/${taskId}/status`
  }
  const index = db.data.tasks.push(itemTask) - 1;
  await db.write();
  setTimeout(async () => {
    db.data.tasks[index].status = TaskStatus.COMPLETED
    await db.write();
  }, 20000);
  return itemTask;
}
