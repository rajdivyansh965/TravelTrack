import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITrip extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    destination: string;
    startDate: Date;
    endDate: Date;
    purpose: string;
    status: string;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        name: { type: String, required: true },
        destination: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        purpose: { type: String, default: "leisure" },
        status: { type: String, default: "planning" },
        notes: { type: String, default: null },
    },
    { timestamps: true }
);

export const Trip: Model<ITrip> =
    mongoose.models.Trip || mongoose.model<ITrip>("Trip", TripSchema);
