import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExchangeRate extends Document {
    _id: mongoose.Types.ObjectId;
    fromCurrency: string;
    toCurrency: string;
    rate: number;
    date: Date;
    createdAt: Date;
}

const ExchangeRateSchema = new Schema<IExchangeRate>(
    {
        fromCurrency: { type: String, required: true },
        toCurrency: { type: String, required: true },
        rate: { type: Number, required: true },
        date: { type: Date, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

ExchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, date: 1 }, { unique: true });

export const ExchangeRate: Model<IExchangeRate> =
    mongoose.models.ExchangeRate || mongoose.model<IExchangeRate>("ExchangeRate", ExchangeRateSchema);
