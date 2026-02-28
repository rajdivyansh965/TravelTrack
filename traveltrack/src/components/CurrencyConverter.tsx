"use client";

import { useState } from "react";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";

// Mock rates for instant conversion
const RATES: Record<string, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53, CAD: 1.36,
    CHF: 0.88, CNY: 7.24, INR: 83.1, MXN: 17.15, SGD: 1.34, HKD: 7.82,
    NOK: 10.55, SEK: 10.38, DKK: 6.87, NZD: 1.63, ZAR: 18.63, BRL: 4.97,
    KRW: 1320, THB: 35.2, MYR: 4.72, PHP: 55.8, IDR: 15600, TWD: 31.5,
};

function convert(amount: number, from: string, to: string): number {
    const fromRate = RATES[from] ?? 1;
    const toRate = RATES[to] ?? 1;
    return Math.round((amount * toRate / fromRate) * 100) / 100;
}

export default function CurrencyConverter() {
    const [amount, setAmount] = useState(100);
    const [from, setFrom] = useState("USD");
    const [to, setTo] = useState("EUR");

    const result = convert(amount, from, to);
    const rate = convert(1, from, to);

    const swap = () => {
        setFrom(to);
        setTo(from);
    };

    return (
        <div className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <RefreshCw size={16} style={{ color: "var(--accent-primary)" }} />
                <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Currency Converter</h3>
            </div>

            <div style={{ marginBottom: "12px" }}>
                <label className="form-label">Amount</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="input-field"
                    style={{ fontSize: "18px", fontWeight: 600, padding: "10px 12px" }}
                />
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "end", marginBottom: "14px" }}>
                <div style={{ flex: 1 }}>
                    <label className="form-label">From</label>
                    <select value={from} onChange={(e) => setFrom(e.target.value)} className="select-field">
                        {CURRENCIES.slice(0, 24).map((c) => (
                            <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={swap}
                    style={{
                        width: "36px", height: "38px", borderRadius: "8px",
                        background: "var(--bg-muted)", border: "1px solid var(--border)",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginBottom: "0px",
                    }}
                >
                    <ArrowLeftRight size={14} style={{ color: "var(--text-secondary)" }} />
                </button>
                <div style={{ flex: 1 }}>
                    <label className="form-label">To</label>
                    <select value={to} onChange={(e) => setTo(e.target.value)} className="select-field">
                        {CURRENCIES.slice(0, 24).map((c) => (
                            <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ padding: "12px 14px", background: "var(--accent-light)", borderRadius: "10px", textAlign: "center" }}>
                <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--accent-primary)" }}>
                    {CURRENCIES.find((c) => c.code === to)?.symbol}{result.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                    1 {from} = {rate} {to}
                </p>
            </div>
        </div>
    );
}
