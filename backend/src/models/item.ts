export interface Item {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string; // ISO 8601 date-time string
}

export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED"
}

export enum ItemTask {
  DELAY = "DELAY",
  WAIT = "WAIT",
  HOLD = "HOLD",
  PAUSE = "PAUSE"
}

export interface WaitTask {
  task: ItemTask.WAIT,
  length: number
}

export interface HoldTask {
  task: ItemTask.HOLD,
  duration: number
}

export interface PauseTask {
  task: ItemTask.PAUSE,
  seconds: number
}

export interface Task {
  id: string;
  itemId: string;
  status: TaskStatus
  task: ItemTask
  monitorUrl: string
}

export interface ErrorResponse {
  code: number;
  message: string;
}