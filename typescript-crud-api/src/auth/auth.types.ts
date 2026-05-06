// Typed request interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string;
}

// Typed response interfaces
export interface LoginResponse {
    token: string;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
}

export interface RegisterResponse {
    message: string;
}