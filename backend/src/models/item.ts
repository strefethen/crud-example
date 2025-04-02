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

export enum ItemAction {
  DELAY = "DELAY",
  WAIT = "WAIT",
  HOLD = "HOLD",
  PAUSE = "PAUSE"
}

export interface WaitAction {
  action: ItemAction.WAIT,
  length: number
}

export interface HoldAction {
  action: ItemAction.HOLD,
  duration: number
}

export interface PauseAction {
  action: ItemAction.PAUSE,
  seconds: number
}

export interface Task {
  id: string;
  itemId: string;
  status: TaskStatus
  action: ItemAction
}

export interface ErrorResponse {
  code: number;
  message: string;
}