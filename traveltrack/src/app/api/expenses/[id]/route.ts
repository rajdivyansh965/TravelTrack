import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const expense = await prisma.expense.findFirst({
            where: { id, userId: session.user.id },
            include: { trip: { select: { name: true } } },
        });

        if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(expense);
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

        const existing = await prisma.expense.findFirst({ where: { id, userId: session.user.id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const expense = await prisma.expense.update({
            where: { id },
            data: {
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
        });

        return NextResponse.json(expense);
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
        const existing = await prisma.expense.findFirst({ where: { id, userId: session.user.id } });
        if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

        await prisma.expense.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
