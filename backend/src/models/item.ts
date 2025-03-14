export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  createdAt: string; // ISO 8601 date-time string
}

export interface ErrorResponse {
  code: number;
  message: string;
}