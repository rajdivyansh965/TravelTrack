import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Trip, Budget, Expense, ItineraryItem } from "@/lib/models";
import { tripSchema } from "@/lib/validations";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        const trips = await Trip.find({ userId: session.user.id })
            .sort({ startDate: -1 })
            .lean();

        // Populate budget and expenses for each trip
        const tripsWithData = await Promise.all(
            trips.map(async (trip) => {
                const budget = await Budget.findOne({ tripId: trip._id }).lean();
                const expenses = await Expense.find({ tripId: trip._id }).lean();
                const itineraryCount = await ItineraryItem.countDocuments({ tripId: trip._id });

                return {
                    ...trip,
                    id: trip._id.toString(),
                    budget: budget ? { ...budget, id: budget._id.toString() } : null,
                    expenses: expenses.map((e: any) => ({ ...e, id: e._id.toString() })),
                    _count: { expenses: expenses.length, itinerary: itineraryCount },
                };
            })
        );

        return NextResponse.json(tripsWithData);
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

        await connectDB();

        const trip = await Trip.create({
            userId: session.user.id,
            name,
            destination,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            purpose,
            status: "planning",
            notes: notes || null,
        });

        const tripObj = trip.toObject();
        return NextResponse.json(
            { ...tripObj, id: tripObj._id.toString(), budget: null, _count: { expenses: 0 } },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST /api/trips error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
