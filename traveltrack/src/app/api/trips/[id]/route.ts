import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Trip, Budget, Expense, ItineraryItem } from "@/lib/models";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const trip = await Trip.findOne({ _id: id, userId: session.user.id }).lean();
        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const budget = await Budget.findOne({ tripId: id }).lean();
        const expenses = await Expense.find({ tripId: id }).sort({ date: -1 }).lean();
        const itinerary = await ItineraryItem.find({ tripId: id }).sort({ date: 1, order: 1 }).lean();

        return NextResponse.json({
            ...trip,
            id: trip._id.toString(),
            budget: budget ? { ...budget, id: budget._id.toString() } : null,
            expenses: expenses.map((e) => ({ ...e, id: e._id.toString() })),
            itinerary: itinerary.map((i) => ({ ...i, id: i._id.toString() })),
        });
    } catch (error) {
        console.error("GET /api/trips/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        await connectDB();

        const existing = await Trip.findOne({ _id: id, userId: session.user.id });
        if (!existing) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const trip = await Trip.findByIdAndUpdate(
            id,
            {
                name: body.name ?? existing.name,
                destination: body.destination ?? existing.destination,
                startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
                endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
                purpose: body.purpose ?? existing.purpose,
                status: body.status ?? existing.status,
                notes: body.notes !== undefined ? body.notes : existing.notes,
            },
            { new: true }
        ).lean();

        return NextResponse.json({ ...trip, id: trip!._id.toString() });
    } catch (error) {
        console.error("PUT /api/trips/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const existing = await Trip.findOne({ _id: id, userId: session.user.id });
        if (!existing) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        // Cascade delete related documents
        await ItineraryItem.deleteMany({ tripId: id });
        await Expense.deleteMany({ tripId: id });
        await Budget.deleteMany({ tripId: id });
        await Trip.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/trips/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
