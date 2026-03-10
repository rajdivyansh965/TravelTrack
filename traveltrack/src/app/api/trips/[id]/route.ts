import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const trip = await prisma.trip.findFirst({
            where: { id, userId: session.user.id },
            include: {
                budget: { include: { categories: true } },
                expenses: { orderBy: { date: "desc" } },
                itinerary: { orderBy: [{ date: "asc" }, { order: "asc" }] },
            },
        });

        if (!trip) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        return NextResponse.json(trip);
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

        const existing = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
        if (!existing) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        const trip = await prisma.trip.update({
            where: { id },
            data: {
                name: body.name ?? existing.name,
                destination: body.destination ?? existing.destination,
                startDate: body.startDate ? new Date(body.startDate) : existing.startDate,
                endDate: body.endDate ? new Date(body.endDate) : existing.endDate,
                purpose: body.purpose ?? existing.purpose,
                status: body.status ?? existing.status,
                notes: body.notes !== undefined ? body.notes : existing.notes,
            },
        });

        return NextResponse.json(trip);
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
        const existing = await prisma.trip.findFirst({ where: { id, userId: session.user.id } });
        if (!existing) {
            return NextResponse.json({ error: "Trip not found" }, { status: 404 });
        }

        // MongoDB doesn't support cascade deletes — manually delete related records
        await prisma.itineraryItem.deleteMany({ where: { tripId: id } });
        await prisma.expense.deleteMany({ where: { tripId: id } });

        const budget = await prisma.budget.findUnique({ where: { tripId: id } });
        if (budget) {
            await prisma.categoryBudget.deleteMany({ where: { budgetId: budget.id } });
            await prisma.budget.delete({ where: { id: budget.id } });
        }

        await prisma.trip.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/trips/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
