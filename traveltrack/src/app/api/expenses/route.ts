import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Expense, Trip } from "@/lib/models";
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

        await connectDB();

        const filter: Record<string, unknown> = { userId: session.user.id };
        if (tripId) filter.tripId = tripId;
        if (category) filter.category = category;

        const expenses = await Expense.find(filter)
            .sort({ date: -1 })
            .limit(limit)
            .lean();

        // Populate trip name for each expense
        const tripIds = [...new Set(expenses.map((e) => e.tripId.toString()))];
        const trips = await Trip.find({ _id: { $in: tripIds } }).select("name destination").lean();
        const tripMap = new Map(trips.map((t) => [t._id.toString(), { name: t.name, destination: t.destination }]));

        const result = expenses.map((e) => ({
            ...e,
            id: e._id.toString(),
            trip: tripMap.get(e.tripId.toString()) || null,
        }));

        return NextResponse.json(result);
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
        await connectDB();

        const expense = await Expense.create({
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
        });

        const result = expense.toObject();
        return NextResponse.json({ ...result, id: result._id.toString() }, { status: 201 });
    } catch (error) {
        console.error("POST /api/expenses error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
