import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/validations";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const tripId = searchParams.get("tripId");
        const category = searchParams.get("category");
        const limit = parseInt(searchParams.get("limit") ?? "50");

        const where: Record<string, unknown> = { userId: session.user.id };
        if (tripId) where.tripId = tripId;
        if (category) where.category = category;

        const expenses = await prisma.expense.findMany({
            where,
            include: { trip: { select: { name: true, destination: true } } },
            orderBy: { date: "desc" },
            take: limit,
        });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error("GET /api/expenses error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = expenseSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const data = parsed.data;
        const expense = await prisma.expense.create({
            data: {
                tripId: data.tripId,
                userId: session.user.id,
                date: new Date(data.date),
                merchant: data.merchant,
                amount: data.amount,
                currency: data.currency,
                category: data.category,
                paymentMethod: data.paymentMethod,
                notes: data.notes || null,
                tags: data.tags || "[]",
                businessExpense: data.businessExpense,
                reimbursable: data.reimbursable,
            },
        });

        return NextResponse.json(expense, { status: 201 });
    } catch (error) {
        console.error("POST /api/expenses error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
