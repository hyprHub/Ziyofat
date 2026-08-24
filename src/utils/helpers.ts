import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, locale: string = 'uz-UZ'): string {
  return new Intl.NumberFormat(locale, {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' UZS';
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getRelativeTime(date: Date, locale: string = 'en'): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

  if (diffInMinutes < 1) return locale === 'uz' ? 'Hozir' : locale === 'ru' ? 'Сейчас' : 'Just now';
  if (diffInMinutes < 60) {
    const word = locale === 'uz' ? 'daqiqa oldin' : locale === 'ru' ? 'мин назад' : 'min ago';
    return `${diffInMinutes} ${word}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  const word = locale === 'uz' ? 'soat oldin' : locale === 'ru' ? 'ч назад' : 'h ago';
  return `${diffInHours} ${word}`;
}
