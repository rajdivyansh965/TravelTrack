import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const tripSchema = z.object({
    name: z.string().min(1, "Trip name is required"),
    destination: z.string().min(1, "Destination is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    purpose: z.enum(["business", "leisure", "mixed"]),
    notes: z.string().optional(),
});

export const expenseSchema = z.object({
    tripId: z.string().min(1, "Trip is required"),
    date: z.string().min(1, "Date is required"),
    merchant: z.string().min(1, "Merchant is required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().min(1, "Currency is required"),
    category: z.string().min(1, "Category is required"),
    paymentMethod: z.string().default("card"),
    notes: z.string().optional(),
    tags: z.string().optional(),
    businessExpense: z.boolean().default(false),
    reimbursable: z.boolean().default(false),
});

export const budgetSchema = z.object({
    totalBudget: z.number().positive("Budget must be positive"),
    dailyLimit: z.number().min(0).optional(),
    currency: z.string().default("USD"),
    categories: z.array(z.object({
        category: z.string(),
        allocated: z.number().min(0),
    })).optional(),
});

export const itinerarySchema = z.object({
    date: z.string().min(1, "Date is required"),
    startTime: z.string().optional(),
    duration: z.number().min(1).default(60),
    title: z.string().min(1, "Title is required"),
    location: z.string().optional(),
    estimatedCost: z.number().min(0).default(0),
    notes: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type TripInput = z.infer<typeof tripSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
export type ItineraryInput = z.infer<typeof itinerarySchema>;
