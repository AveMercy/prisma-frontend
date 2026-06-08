import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const base = import.meta.env.VITE_API_URL?.replace('/api', '') || '';
  return `${base}${path}`;
}

export function getApiUrl(path: string): string {
  return `${import.meta.env.VITE_API_URL || '/api'}${path}`;
}