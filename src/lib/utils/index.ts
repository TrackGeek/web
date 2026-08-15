import { type ClassValue, clsx } from "clsx";
import type { ChangeEvent, KeyboardEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const NON_INTEGER_KEYS = [".", ",", "e", "E", "+", "-"];

export function blockNonIntegerKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (NON_INTEGER_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

export function toIntegerValue(value: string): string {
  return value.split(/[.,]/)[0].replace(/[^0-9]/g, "");
}

export function registerInteger<T extends string>(field: UseFormRegisterReturn<T>) {
  return {
    ...field,
    step: 1,
    onKeyDown: blockNonIntegerKeys,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = toIntegerValue(event.target.value);
      return field.onChange(event);
    },
  };
}

export function franchiseSlug(id: number, name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug ? `${id}-${slug}` : String(id);
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
