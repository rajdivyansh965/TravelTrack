import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hash } from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
    // Create demo user
    const passwordHash = await hash("demo1234", 12);
    const user = await prisma.user.upsert({
        where: { email: "demo@traveltrack.app" },
        update: {},
        create: {
            email: "demo@traveltrack.app",
            name: "Alex Morgan",
            passwordHash,
            defaultCurrency: "USD",
        },
    });

    // Trip 1: Completed trip to Tokyo
    const tokyo = await prisma.trip.create({
        data: {
            userId: user.id,
            name: "Tokyo Adventure",
            destination: "Tokyo, Japan",
            startDate: new Date("2025-11-01"),
            endDate: new Date("2025-11-10"),
            purpose: "leisure",
            status: "completed",
            notes: "Amazing 10-day trip exploring Japan's capital",
        },
    });

    await prisma.budget.create({
        data: {
            tripId: tokyo.id,
            totalBudget: 3500,
            dailyLimit: 350,
            currency: "USD",
            categories: {
                create: [
                    { category: "transport", allocated: 800 },
                    { category: "accommodation", allocated: 1200 },
                    { category: "food", allocated: 700 },
                    { category: "activities", allocated: 500 },
                    { category: "shopping", allocated: 200 },
                    { category: "misc", allocated: 100 },
                ],
            },
        },
    });

    const tokyoExpenses = [
        { date: new Date("2025-11-01"), merchant: "Japan Airlines", amount: 650, currency: "USD", category: "transport", paymentMethod: "card" },
        { date: new Date("2025-11-01"), merchant: "Shinjuku Hotel", amount: 120, currency: "USD", category: "accommodation", paymentMethod: "card" },
        { date: new Date("2025-11-02"), merchant: "Ichiran Ramen", amount: 15, currency: "USD", category: "food", paymentMethod: "cash" },
        { date: new Date("2025-11-02"), merchant: "Tokyo Metro", amount: 8, currency: "USD", category: "transport", paymentMethod: "digital" },
        { date: new Date("2025-11-03"), merchant: "TeamLab Borderless", amount: 32, currency: "USD", category: "activities", paymentMethod: "card" },
        { date: new Date("2025-11-03"), merchant: "Tsukiji Fish Market", amount: 28, currency: "USD", category: "food", paymentMethod: "cash" },
        { date: new Date("2025-11-04"), merchant: "Senso-ji Temple Area", amount: 45, currency: "USD", category: "shopping", paymentMethod: "cash" },
        { date: new Date("2025-11-05"), merchant: "Shinkansen to Kyoto", amount: 130, currency: "USD", category: "transport", paymentMethod: "card" },
        { date: new Date("2025-11-05"), merchant: "Kyoto Ryokan", amount: 180, currency: "USD", category: "accommodation", paymentMethod: "card" },
        { date: new Date("2025-11-06"), merchant: "Kinkaku-ji Temple", amount: 5, currency: "USD", category: "activities", paymentMethod: "cash" },
        { date: new Date("2025-11-07"), merchant: "Sushi Dai", amount: 42, currency: "USD", category: "food", paymentMethod: "cash" },
        { date: new Date("2025-11-08"), merchant: "Don Quijote", amount: 85, currency: "USD", category: "shopping", paymentMethod: "card" },
        { date: new Date("2025-11-09"), merchant: "Akihabara Shops", amount: 120, currency: "USD", category: "shopping", paymentMethod: "card" },
        { date: new Date("2025-11-10"), merchant: "Airport Narita Express", amount: 30, currency: "USD", category: "transport", paymentMethod: "card" },
    ];

    for (const exp of tokyoExpenses) {
        await prisma.expense.create({
            data: { ...exp, tripId: tokyo.id, userId: user.id },
        });
    }

    // Trip 2: Active trip to Paris
    const paris = await prisma.trip.create({
        data: {
            userId: user.id,
            name: "Paris Business Trip",
            destination: "Paris, France",
            startDate: new Date("2026-02-24"),
            endDate: new Date("2026-03-02"),
            purpose: "business",
            status: "active",
            notes: "Annual tech conference and client meetings",
        },
    });

    await prisma.budget.create({
        data: {
            tripId: paris.id,
            totalBudget: 2800,
            dailyLimit: 400,
            currency: "EUR",
            categories: {
                create: [
                    { category: "transport", allocated: 600 },
                    { category: "accommodation", allocated: 1000 },
                    { category: "food", allocated: 500 },
                    { category: "activities", allocated: 300 },
                    { category: "misc", allocated: 400 },
                ],
            },
        },
    });

    const parisExpenses = [
        { date: new Date("2026-02-24"), merchant: "Air France", amount: 450, currency: "EUR", category: "transport", paymentMethod: "card", businessExpense: true },
        { date: new Date("2026-02-24"), merchant: "Hotel Le Marais", amount: 180, currency: "EUR", category: "accommodation", paymentMethod: "card", businessExpense: true },
        { date: new Date("2026-02-25"), merchant: "Café de Flore", amount: 22, currency: "EUR", category: "food", paymentMethod: "cash" },
        { date: new Date("2026-02-25"), merchant: "Metro Pass", amount: 16, currency: "EUR", category: "transport", paymentMethod: "card" },
        { date: new Date("2026-02-26"), merchant: "Conference Registration", amount: 250, currency: "EUR", category: "misc", paymentMethod: "card", businessExpense: true },
    ];

    for (const exp of parisExpenses) {
        await prisma.expense.create({
            data: { ...exp, tripId: paris.id, userId: user.id, businessExpense: exp.businessExpense ?? false },
        });
    }

    // Itinerary for Paris
    const parisItinerary = [
        { date: new Date("2026-02-24"), startTime: "08:00", title: "Flight to Paris", location: "CDG Airport", estimatedCost: 450, duration: 480, order: 0 },
        { date: new Date("2026-02-24"), startTime: "18:00", title: "Check-in Hotel Le Marais", location: "4th Arr.", estimatedCost: 180, duration: 60, order: 1 },
        { date: new Date("2026-02-25"), startTime: "09:00", title: "Tech Conference - Day 1", location: "Paris Expo", estimatedCost: 0, duration: 480, order: 0 },
        { date: new Date("2026-02-25"), startTime: "19:00", title: "Team Dinner", location: "Le Comptoir", estimatedCost: 65, duration: 120, order: 1 },
        { date: new Date("2026-02-26"), startTime: "09:00", title: "Tech Conference - Day 2", location: "Paris Expo", estimatedCost: 0, duration: 480, order: 0 },
        { date: new Date("2026-02-27"), startTime: "10:00", title: "Client Meeting - Acme Corp", location: "La Défense", estimatedCost: 0, duration: 120, order: 0 },
        { date: new Date("2026-02-27"), startTime: "14:00", title: "Louvre Museum", location: "1st Arr.", estimatedCost: 17, duration: 180, order: 1 },
        { date: new Date("2026-02-28"), startTime: "09:00", title: "Free Day - Explore Montmartre", location: "18th Arr.", estimatedCost: 50, duration: 360, order: 0 },
    ];

    for (const item of parisItinerary) {
        await prisma.itineraryItem.create({
            data: { ...item, tripId: paris.id },
        });
    }

    // Trip 3: Upcoming trip to Bali
    const bali = await prisma.trip.create({
        data: {
            userId: user.id,
            name: "Bali Getaway",
            destination: "Bali, Indonesia",
            startDate: new Date("2026-04-15"),
            endDate: new Date("2026-04-25"),
            purpose: "leisure",
            status: "planning",
            notes: "Relaxation and surfing retreat",
        },
    });

    await prisma.budget.create({
        data: {
            tripId: bali.id,
            totalBudget: 2000,
            dailyLimit: 180,
            currency: "USD",
            categories: {
                create: [
                    { category: "transport", allocated: 500 },
                    { category: "accommodation", allocated: 600 },
                    { category: "food", allocated: 400 },
                    { category: "activities", allocated: 350 },
                    { category: "misc", allocated: 150 },
                ],
            },
        },
    });

    console.log("✅ Seed data created successfully!");
    console.log(`   Demo user: demo@traveltrack.app / demo1234`);
    console.log(`   Trips: ${tokyo.name}, ${paris.name}, ${bali.name}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
