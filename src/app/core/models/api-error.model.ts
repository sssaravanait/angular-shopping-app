/** One consistent error shape used across the whole app. */
export interface ApiError {
    /** HTTP status code. 0 means the network is down or the server is unreachable. */
    readonly status: number;
    /** Human-readable message safe to show to users. */
    readonly message: string;
    /** Field-level validation errors from the server, e.g. { email: 'Already used' } */
    readonly fieldErrors?: Record<string, string>;
}