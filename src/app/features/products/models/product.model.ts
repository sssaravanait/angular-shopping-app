export const PRODUCT_CATEGORIES = [
    { value: 'ac', label: 'Air Conditioner' },
    { value: 'tv', label: 'Television' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'others', label: 'Others' },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]['value'];

export const MAX_STOCK_QUANTITY = 1000;

/** Product as returned by the API. Decimal prices remain strings to preserve precision. */
export interface Product {
    readonly id: number;
    readonly name: string;
    readonly category: ProductCategory;
    readonly sku: string;
    readonly price: string;
    readonly stock_quantity: number;
    readonly is_active: boolean;
    readonly created_at: string;
    readonly updated_at: string;
    readonly deleted_at: string | null;
}

export interface ProductPage {
    readonly page: number;
    readonly per_page: number;
    readonly total_pages: number;
    readonly total_items: number;
    readonly data: Product[];
}

/** Fields controlled by the product form; IDs and timestamps are server-managed. */
export interface ProductPayload {
    name: string;
    category: ProductCategory;
    sku: string;
    price: string;
    stock_quantity: number;
    is_active: boolean;
}
