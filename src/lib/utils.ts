import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractNameFromEmail(email: string): string {
  if (!email.includes("@")) return "";

  const name = email.split("@")[0].replace(/\./g, "");

  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function getInitialsFromName(name: string): string {
  const words = name.trim().split(" ");
  if (words.length === 0) return "";

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }

  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();

  return firstInitial + lastInitial;
}

export function openPopup(url: string, width = 600, height = 400): Window | null {
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  return window.open(url, 'popup', `width=${width},height=${height},left=${left},top=${top}`)
}