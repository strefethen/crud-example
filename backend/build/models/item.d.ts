export interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    createdAt: string;
}
export interface ErrorResponse {
    code: number;
    message: string;
}
