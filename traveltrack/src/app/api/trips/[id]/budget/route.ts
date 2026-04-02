import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Trip, Budget } from "@/lib/models";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: tripId } = await params;
        await connectDB();

        // Verify trip belongs to user
        const trip = await Trip.findOne({ _id: tripId, userId: session.user.id });
        if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

        const budget = await Budget.findOne({ tripId }).lean();
        return NextResponse.json(budget ? { ...budget, id: budget._id.toString() } : null);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: tripId } = await params;
        const body = await req.json();
        await connectDB();

        const trip = await Trip.findOne({ _id: tripId, userId: session.user.id });
        if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

        const existing = await Budget.findOne({ tripId });

        if (existing) {
            existing.totalBudget = body.totalBudget ?? existing.totalBudget;
            existing.dailyLimit = body.dailyLimit ?? existing.dailyLimit;
            existing.currency = body.currency ?? existing.currency;
            if (body.categories) {
                existing.categories = body.categories.map((c: { category: string; allocated: number }) => ({
                    category: c.category,
                    allocated: c.allocated,
                }));
            }
            await existing.save();
            const result = existing.toObject();
            return NextResponse.json({ ...result, id: result._id.toString() });
        }

        const budget = await Budget.create({
            tripId,
            totalBudget: body.totalBudget || 0,
            dailyLimit: body.dailyLimit || 0,
            currency: body.currency || "USD",
            categories: body.categories
                ? body.categories.map((c: { category: string; allocated: number }) => ({
                    category: c.category,
                    allocated: c.allocated,
                }))
                : [],
        });

        const result = budget.toObject();
        return NextResponse.json({ ...result, id: result._id.toString() }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
