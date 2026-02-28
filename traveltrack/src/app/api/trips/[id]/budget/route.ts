import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id: tripId } = await params;
        const budget = await prisma.budget.findFirst({
            where: { tripId, trip: { userId: session.user.id } },
            include: { categories: true },
        });

        return NextResponse.json(budget);
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

        const existing = await prisma.budget.findFirst({ where: { tripId } });

        if (existing) {
            await prisma.categoryBudget.deleteMany({ where: { budgetId: existing.id } });
            const budget = await prisma.budget.update({
                where: { id: existing.id },
                data: {
                    totalBudget: body.totalBudget ?? existing.totalBudget,
                    dailyLimit: body.dailyLimit ?? existing.dailyLimit,
                    currency: body.currency ?? existing.currency,
                    categories: body.categories ? {
                        create: body.categories.map((c: { category: string; allocated: number }) => ({
                            category: c.category,
                            allocated: c.allocated,
                        })),
                    } : undefined,
                },
                include: { categories: true },
            });
            return NextResponse.json(budget);
        }

        const budget = await prisma.budget.create({
            data: {
                tripId,
                totalBudget: body.totalBudget || 0,
                dailyLimit: body.dailyLimit || 0,
                currency: body.currency || "USD",
                categories: body.categories ? {
                    create: body.categories.map((c: { category: string; allocated: number }) => ({
                        category: c.category,
                        allocated: c.allocated,
                    })),
                } : undefined,
            },
            include: { categories: true },
        });

        return NextResponse.json(budget, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
