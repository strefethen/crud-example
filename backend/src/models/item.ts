export interface Item {
  id: number;
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
  WAIT = 0,
}
export interface Task {
  id: number;
  itemId: number;
  status: TaskStatus
  action: ItemAction
}

export interface ErrorResponse {
  code: number;
  message: string;
}