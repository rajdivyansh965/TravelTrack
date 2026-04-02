import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExpense extends Document {
    _id: mongoose.Types.ObjectId;
    tripId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    date: Date;
    merchant: string;
    amount: number;
    currency: string;
    category: string;
    paymentMethod: string;
    receiptUrl?: string | null;
    notes?: string | null;
    tags: string;
    locationLat?: number | null;
    locationLng?: number | null;
    locationAddr?: string | null;
    businessExpense: boolean;
    reimbursable: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
    {
        tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        date: { type: Date, required: true },
        merchant: { type: String, required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: "USD" },
        category: { type: String, required: true },
        paymentMethod: { type: String, default: "card" },
        receiptUrl: { type: String, default: null },
        notes: { type: String, default: null },
        tags: { type: String, default: "[]" },
        locationLat: { type: Number, default: null },
        locationLng: { type: Number, default: null },
        locationAddr: { type: String, default: null },
        businessExpense: { type: Boolean, default: false },
        reimbursable: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Expense: Model<IExpense> =
    mongoose.models.Expense || mongoose.model<IExpense>("Expense", ExpenseSchema);
