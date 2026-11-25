// Frontend settings (values come from frontend/.env.local or the Vercel dashboard)
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
