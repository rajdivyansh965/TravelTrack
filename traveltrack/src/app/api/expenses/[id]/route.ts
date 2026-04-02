import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Expense, Trip } from "@/lib/models";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await connectDB();

        const expense = await Expense.findOne({ _id: id, userId: session.user.id }).lean();
        if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const trip = await Trip.findById(expense.tripId).select("name").lean();

        return NextResponse.json({ ...expense, id: expense._id.toString(), trip });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        await connectDB();

        const existing = await Expense.findOne({ _id: id, userId: session.user.id });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const expense = await Expense.findByIdAndUpdate(
            id,
            {
                date: body.date ? new Date(body.date) : undefined,
                merchant: body.merchant,
                amount: body.amount,
                currency: body.currency,
                category: body.category,
                paymentMethod: body.paymentMethod,
                notes: body.notes,
                tags: body.tags,
                businessExpense: body.businessExpense,
                reimbursable: body.reimbursable,
            },
            { new: true }
        ).lean();

        return NextResponse.json({ ...expense, id: expense!._id.toString() });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        await connectDB();

        const existing = await Expense.findOne({ _id: id, userId: session.user.id });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        await Expense.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
