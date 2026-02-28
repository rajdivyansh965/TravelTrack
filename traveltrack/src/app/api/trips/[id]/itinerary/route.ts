import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: tripId } = await params;
        const items = await prisma.itineraryItem.findMany({
            where: { tripId, trip: { userId: session.user.id } },
            orderBy: [{ date: "asc" }, { order: "asc" }],
        });

        return NextResponse.json(items);
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

        const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: session.user.id } });
        if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

        const maxOrder = await prisma.itineraryItem.findFirst({
            where: { tripId, date: new Date(body.date) },
            orderBy: { order: "desc" },
        });

        const item = await prisma.itineraryItem.create({
            data: {
                tripId,
                date: new Date(body.date),
                startTime: body.startTime || null,
                duration: body.duration || 60,
                title: body.title,
                location: body.location || null,
                estimatedCost: body.estimatedCost || 0,
                notes: body.notes || null,
                order: (maxOrder?.order ?? -1) + 1,
            },
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
