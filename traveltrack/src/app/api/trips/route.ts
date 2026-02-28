import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/lib/validations";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const trips = await prisma.trip.findMany({
            where: { userId: session.user.id },
            include: {
                budget: { include: { categories: true } },
                expenses: true,
                _count: { select: { expenses: true, itinerary: true } },
            },
            orderBy: { startDate: "desc" },
        });

        return NextResponse.json(trips);
    } catch (error) {
        console.error("GET /api/trips error:", error);
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
        const parsed = tripSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
        }

        const { name, destination, startDate, endDate, purpose, notes } = parsed.data;

        const trip = await prisma.trip.create({
            data: {
                userId: session.user.id,
                name,
                destination,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                purpose,
                status: "planning",
                notes: notes || null,
            },
            include: {
                budget: true,
                _count: { select: { expenses: true } },
            },
        });

        return NextResponse.json(trip, { status: 201 });
    } catch (error) {
        console.error("POST /api/trips error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
