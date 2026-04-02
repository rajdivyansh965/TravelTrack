import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItineraryItem extends Document {
    _id: mongoose.Types.ObjectId;
    tripId: mongoose.Types.ObjectId;
    date: Date;
    startTime?: string | null;
    duration: number;
    title: string;
    location?: string | null;
    estimatedCost: number;
    notes?: string | null;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ItineraryItemSchema = new Schema<IItineraryItem>(
    {
        tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
        date: { type: Date, required: true },
        startTime: { type: String, default: null },
        duration: { type: Number, default: 60 },
        title: { type: String, required: true },
        location: { type: String, default: null },
        estimatedCost: { type: Number, default: 0 },
        notes: { type: String, default: null },
        order: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const ItineraryItem: Model<IItineraryItem> =
    mongoose.models.ItineraryItem || mongoose.model<IItineraryItem>("ItineraryItem", ItineraryItemSchema);
