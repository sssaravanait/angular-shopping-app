/**
 * Customer as returned by the API (read model).
 * `readonly` = the app must never mutate a loaded customer directly.
 */
export interface Customer {
    readonly id: number;
    readonly first_name: string;
    readonly last_name: string;
    readonly email: string;
    readonly phone: string;
    readonly dob: string;
    readonly created_at: string;
    readonly updated_at: string;
    readonly addresses: [];
}

/** Paginated list response from GET /customers */
export interface CustomerPage {
    readonly page: number;
    readonly per_page: number;
    readonly total_pages: number;
    readonly total_items: number;
    readonly data: Customer[];
}

/**
 * Body sent to POST (create) and PUT (update).
 * Only the fields the user can control. No id or timestamps.
 */
export interface CustomerPayload {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    dob: string;
}