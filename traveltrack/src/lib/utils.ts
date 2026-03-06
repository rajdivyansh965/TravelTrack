import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(date: Date | string): string {
    return format(new Date(date), "MMM dd, yyyy");
}

export function formatDateShort(date: Date | string): string {
    return format(new Date(date), "MMM dd");
}

export function formatDateTime(date: Date | string): string {
    return format(new Date(date), "MMM dd, yyyy hh:mm a");
}

export function getDaysRemaining(endDate: Date | string): number {
    return differenceInDays(new Date(endDate), new Date());
}

export function getTripDuration(startDate: Date | string, endDate: Date | string): number {
    return differenceInDays(new Date(endDate), new Date(startDate)) + 1;
}

export function getTripStatus(startDate: Date | string, endDate: Date | string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (isAfter(start, now)) return "planning";
    if (isBefore(end, now)) return "completed";
    return "active";
}

export function isTripActive(startDate: Date | string, endDate: Date | string): boolean {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    return !isBefore(now, start) && !isAfter(now, end);
}

export function getBudgetColor(percentage: number): string {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-amber-500";
    return "text-emerald-500";
}

export function getBudgetBgColor(percentage: number): string {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 75) return "bg-amber-500";
    return "bg-emerald-500";
}

export function getPercentage(spent: number, total: number): number {
    if (total === 0) return 0;
    return Math.min(Math.round((spent / total) * 100), 100);
}

export const EXPENSE_CATEGORIES = [
    { value: "transport", label: "Transport", icon: "✈️" },
    { value: "accommodation", label: "Accommodation", icon: "🏨" },
    { value: "food", label: "Food & Dining", icon: "🍽️" },
    { value: "activities", label: "Activities", icon: "🎭" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "health", label: "Health", icon: "🏥" },
    { value: "communication", label: "Communication", icon: "📱" },
    { value: "insurance", label: "Insurance", icon: "🛡️" },
    { value: "misc", label: "Miscellaneous", icon: "📦" },
] as const;

export const PAYMENT_METHODS = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "card", label: "Credit/Debit Card", icon: "💳" },
    { value: "digital", label: "Digital Wallet", icon: "📲" },
    { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
] as const;

export const TRIP_PURPOSES = [
    { value: "business", label: "Business" },
    { value: "leisure", label: "Leisure" },
    { value: "mixed", label: "Mixed" },
] as const;

export function getCategoryIcon(category: string): string {
    return EXPENSE_CATEGORIES.find((c) => c.value === category)?.icon ?? "📦";
}

export function getCategoryLabel(category: string): string {
    return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}
