// core/auth/auth.models.ts

export interface User {
    id: number;
    username: string;
    email?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}