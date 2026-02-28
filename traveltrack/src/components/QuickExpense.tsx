"use client";

import { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/utils";

interface Trip { id: string; name: string; status: string; }

export default function QuickExpense() {
    const [open, setOpen] = useState(false);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetch("/api/trips").then((r) => r.json()).then((data: Trip[]) => {
            setTrips(data);
        }).catch(() => { });
    }, []);

    const activeTrip = trips.find((t) => t.status === "active");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);

        const res = await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tripId: fd.get("tripId"),
                date: fd.get("date") || new Date().toISOString().split("T")[0],
                merchant: fd.get("merchant"),
                amount: parseFloat(fd.get("amount") as string),
                currency: "USD",
                category: fd.get("category"),
                paymentMethod: fd.get("paymentMethod") || "card",
            }),
        });

        setSaving(false);
        if (res.ok) {
            setSuccess(true);
            setTimeout(() => { setSuccess(false); setOpen(false); }, 1200);
        }
    };

    return (
        <>
            <button className="fab" onClick={() => setOpen(true)} aria-label="Quick add expense">
                <Plus size={22} />
            </button>

            {open && (
                <div className="modal-backdrop" onClick={() => setOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "380px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>Quick Expense</h3>
                            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                                <X size={18} />
                            </button>
                        </div>

                        {success ? (
                            <div style={{ textAlign: "center", padding: "24px" }}>
                                <div style={{ fontSize: "40px", marginBottom: "10px" }}>✅</div>
                                <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--success)" }}>Expense added!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: "12px" }}>
                                    <label className="form-label">Trip</label>
                                    <select name="tripId" className="select-field" required defaultValue={activeTrip?.id || ""}>
                                        <option value="" disabled>Select trip...</option>
                                        {trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                    <div>
                                        <label className="form-label">Amount</label>
                                        <input name="amount" type="number" step="0.01" placeholder="0.00" className="input-field" required style={{ fontSize: "16px", fontWeight: 600 }} />
                                    </div>
                                    <div>
                                        <label className="form-label">Date</label>
                                        <input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="input-field" />
                                    </div>
                                </div>

                                <div style={{ marginBottom: "12px" }}>
                                    <label className="form-label">Merchant</label>
                                    <input name="merchant" placeholder="e.g. Uber, Hotel, Restaurant" className="input-field" required />
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                                    <div>
                                        <label className="form-label">Category</label>
                                        <select name="category" className="select-field" required>
                                            {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Payment</label>
                                        <select name="paymentMethod" className="select-field">
                                            {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <button type="submit" className="btn-accent" disabled={saving} style={{
                                    width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                                }}>
                                    {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Add Expense"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
