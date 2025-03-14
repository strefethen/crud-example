import axios, { AxiosInstance } from 'axios';

// Interfaces for schemas
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

// API Endpoints
export namespace API {
  // GET /api/items
  export namespace GetItems {
    export type Response200 = Item[];
    export type Response400 = ErrorResponse;
  }

  // POST /api/items
  export namespace CreateItem {
    export interface RequestBody {
      name: string;
      description: string;
      price: number;
    }
    export type Response201 = Item;
    export type Response400 = ErrorResponse;
  }

  // GET /api/items/{id}
  export namespace GetItemById {
    export interface PathParameters {
      id: number;
    }
    export type Response200 = Item;
    export type Response400 = ErrorResponse;
    export type Response404 = ErrorResponse;
  }

  // PUT /api/items/{id}
  export namespace UpdateItemById {
    export interface PathParameters {
      id: number;
    }
    export interface RequestBody {
      name: string;
      description: string;
      price: number;
    }
    export type Response200 = Item;
    export type Response400 = ErrorResponse;
    export type Response404 = ErrorResponse;
  }

  // DELETE /api/items/{id}
  export namespace DeleteItemById {
    export interface PathParameters {
      id: number;
    }
    export type Response204 = void;
    export type Response400 = ErrorResponse;
    export type Response404 = ErrorResponse;
  }
}

export class ItemsResource {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
    });
  }

  // GET /api/items
  async getItems(): Promise<Item[]> {
    try {
      const response = await this.axiosInstance.get<API.GetItems.Response200>('/api/items');
      return response.data;
    } catch (error) {
      this.handleError<API.GetItems.Response400>(error);
    }
  }

  // POST /api/items
  async createItem(requestBody: API.CreateItem.RequestBody): Promise<Item> {
    try {
      const response = await this.axiosInstance.post<API.CreateItem.Response201>('/api/items', requestBody);
      return response.data;
    } catch (error) {
      this.handleError<API.CreateItem.Response400>(error);
    }
  }

  // GET /api/items/{id}
  async getItemById(id: number): Promise<Item> {
    try {
      const response = await this.axiosInstance.get<API.GetItemById.Response200>(`/api/items/${id}`);
      return response.data;
    } catch (error) {
      this.handleError<API.GetItemById.Response400 | API.GetItemById.Response404>(error);
    }
  }

  // PUT /api/items/{id}
  async updateItemById(id: number, requestBody: API.UpdateItemById.RequestBody): Promise<Item> {
    try {
      const response = await this.axiosInstance.put<API.UpdateItemById.Response200>(`/api/items/${id}`, requestBody);
      return response.data;
    } catch (error) {
      this.handleError<API.UpdateItemById.Response400 | API.UpdateItemById.Response404>(error);
    }
  }

  // DELETE /api/items/{id}
  async deleteItemById(id: number): Promise<void> {
    try {
      await this.axiosInstance.delete<API.DeleteItemById.Response204>(`/api/items/${id}`);
    } catch (error) {
      this.handleError<API.DeleteItemById.Response400 | API.DeleteItemById.Response404>(error);
    }
  }

  // Generic error handler
  private handleError<T extends ErrorResponse>(error: unknown): never {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data as T;
      console.error(`Error (${error.response.status}): ${errorData.message}`);
      throw new Error(errorData.message);
    } else {
      console.error('Unexpected error:', error);
      throw new Error('An unexpected error occurred.');
    }
  }
}