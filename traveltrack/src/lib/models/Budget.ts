import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryBudget {
    category: string;
    allocated: number;
}

const CategoryBudgetSchema = new Schema<ICategoryBudget>(
    {
        category: { type: String, required: true },
        allocated: { type: Number, default: 0 },
    },
    { _id: true, timestamps: true }
);

export interface IBudget extends Document {
    _id: mongoose.Types.ObjectId;
    tripId: mongoose.Types.ObjectId;
    totalBudget: number;
    dailyLimit: number;
    currency: string;
    categories: ICategoryBudget[];
    createdAt: Date;
    updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
    {
        tripId: { type: Schema.Types.ObjectId, ref: "Trip", required: true, unique: true, index: true },
        totalBudget: { type: Number, default: 0 },
        dailyLimit: { type: Number, default: 0 },
        currency: { type: String, default: "USD" },
        categories: [CategoryBudgetSchema],
    },
    { timestamps: true }
);

export const Budget: Model<IBudget> =
    mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);
