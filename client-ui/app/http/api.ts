import axios from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true,   // send auth cookies automatically
})

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Customer {
    _id: string;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    addresses: { _id: string; text: string; isDefault: boolean }[];
}

// ── Order service endpoints ───────────────────────────────────────────────────
const ORDER_SERVICE_PREFIX = '/api/order'
export const getCustomer = () => api.get<Customer>(`${ORDER_SERVICE_PREFIX}/customer`)
