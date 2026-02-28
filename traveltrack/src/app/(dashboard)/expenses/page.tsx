"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, X, Loader2, FileDown } from "lucide-react";
import {
    formatCurrency, formatDateShort, getCategoryIcon, getCategoryLabel,
    EXPENSE_CATEGORIES, PAYMENT_METHODS,
} from "@/lib/utils";
import { exportAllExpensesPDF } from "@/lib/pdf-export";

interface Expense {
    id: string;
    date: string;
    merchant: string;
    amount: number;
    currency: string;
    category: string;
    paymentMethod: string;
    notes: string | null;
    businessExpense: boolean;
    trip?: { id: string; name: string };
}

interface Trip { id: string; name: string; status: string; }

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = () => {
        Promise.all([
            fetch("/api/expenses").then((r) => r.json()),
            fetch("/api/trips").then((r) => r.json()),
        ]).then(([exp, trp]) => {
            setExpenses(exp);
            setTrips(trp);
            setLoading(false);
        }).catch(() => setLoading(false));
    };

    useEffect(load, []);

    const filtered = expenses.filter((e) => {
        const matchSearch = e.merchant.toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === "all" || e.category === categoryFilter;
        return matchSearch && matchCat;
    });

    const totalSpent = filtered.reduce((s, e) => s + e.amount, 0);

    const deleteExpense = async (id: string) => {
        await fetch(`/api/expenses/${id}`, { method: "DELETE" });
        load();
    };

    const addExpense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tripId: fd.get("tripId"),
                date: fd.get("date"),
                merchant: fd.get("merchant"),
                amount: parseFloat(fd.get("amount") as string),
                currency: fd.get("currency") || "USD",
                category: fd.get("category"),
                paymentMethod: fd.get("paymentMethod"),
            }),
        });
        setSaving(false);
        setShowModal(false);
        load();
    };

    if (loading) return <div className="skeleton" style={{ height: "200px" }} />;

    return (
        <div className="animate-fade-in" style={{ maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: "22px", fontWeight: 700 }}>Expenses</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "3px" }}>
                        {filtered.length} expenses · {formatCurrency(totalSpent)}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setShowModal(true)} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Plus size={15} /> Add Expense
                    </button>
                    {expenses.length > 0 && (
                        <button onClick={() => exportAllExpensesPDF(expenses)} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <FileDown size={15} /> Export PDF
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "180px", position: "relative" }}>
                    <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search expenses..." className="input-field" style={{ paddingLeft: "36px" }} />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-field" style={{ width: "auto", minWidth: "160px" }}>
                    <option value="all">All Categories</option>
                    {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
            </div>

            {/* Expense List */}
            {filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No expenses found</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filtered.map((exp) => (
                        <div key={exp.id} className="glass-card" style={{ padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "38px", height: "38px", borderRadius: "9px",
                                    background: "var(--bg-muted)",
                                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px",
                                }}>
                                    {getCategoryIcon(exp.category)}
                                </div>
                                <div>
                                    <p style={{ fontSize: "14px", fontWeight: 500 }}>{exp.merchant}</p>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                        {formatDateShort(exp.date)} · {getCategoryLabel(exp.category)}
                                        {exp.trip && <> · <span style={{ color: "var(--accent-primary)" }}>{exp.trip.name}</span></>}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontWeight: 600, fontSize: "14px" }}>{formatCurrency(exp.amount, exp.currency)}</span>
                                <button onClick={() => deleteExpense(exp.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Expense Modal */}
            {showModal && (
                <div className="modal-backdrop" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Add Expense</h3>
                            <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={addExpense}>
                            <div style={{ marginBottom: "12px" }}>
                                <label className="form-label">Trip</label>
                                <select name="tripId" className="select-field" required>
                                    <option value="">Select trip...</option>
                                    {trips.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                <div><label className="form-label">Amount</label><input name="amount" type="number" step="0.01" className="input-field" required /></div>
                                <div><label className="form-label">Date</label><input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="input-field" required /></div>
                            </div>
                            <div style={{ marginBottom: "12px" }}><label className="form-label">Merchant</label><input name="merchant" className="input-field" required /></div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                                <div><label className="form-label">Category</label><select name="category" className="select-field" required>
                                    {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                                </select></div>
                                <div><label className="form-label">Payment</label><select name="paymentMethod" className="select-field">
                                    {PAYMENT_METHODS.map((p) => <option key={p.value} value={p.value}>{p.icon} {p.label}</option>)}
                                </select></div>
                            </div>
                            <button type="submit" disabled={saving} className="btn-accent" style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Add Expense"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
