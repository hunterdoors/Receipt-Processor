import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatFileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

export function getFileExtension(filename: string) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase()
}

export function isImageFile(filename: string) {
  const ext = getFileExtension(filename)
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
}

export function isPdfFile(filename: string) {
  return getFileExtension(filename) === "pdf"
}

export function truncateString(str: string, length: number) {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}
