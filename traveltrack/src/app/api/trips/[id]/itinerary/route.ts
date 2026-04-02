import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Trip, ItineraryItem } from "@/lib/models";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: tripId } = await params;
        await connectDB();

        // Verify trip belongs to user
        const trip = await Trip.findOne({ _id: tripId, userId: session.user.id });
        if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

        const items = await ItineraryItem.find({ tripId })
            .sort({ date: 1, order: 1 })
            .lean();

        return NextResponse.json(items.map((i) => ({ ...i, id: i._id.toString() })));
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

        const maxOrderItem = await ItineraryItem.findOne({
            tripId,
            date: new Date(body.date),
        }).sort({ order: -1 });

        const item = await ItineraryItem.create({
            tripId,
            date: new Date(body.date),
            startTime: body.startTime || null,
            duration: body.duration || 60,
            title: body.title,
            location: body.location || null,
            estimatedCost: body.estimatedCost || 0,
            notes: body.notes || null,
            order: (maxOrderItem?.order ?? -1) + 1,
        });

        const result = item.toObject();
        return NextResponse.json({ ...result, id: result._id.toString() }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
