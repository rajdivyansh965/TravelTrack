"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft, MapPin, Calendar, Clock, Trash2, Plus,
    X, Loader2, FileDown
} from "lucide-react";
import {
    formatCurrency, formatDate, formatDateShort, getTripDuration,
    getCategoryIcon, getCategoryLabel, EXPENSE_CATEGORIES, PAYMENT_METHODS,
} from "@/lib/utils";
import { exportTripPDF } from "@/lib/pdf-export";

interface PageProps {
    params: Promise<{ id: string }>;
}

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
}

interface ItineraryItem {
    id: string;
    date: string;
    startTime: string | null;
    duration: number;
    title: string;
    location: string | null;
    estimatedCost: number;
}

interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    purpose: string;
    status: string;
    notes: string | null;
    expenses: Expense[];
    itinerary: ItineraryItem[];
    budget: { totalBudget: number; currency: string; dailyLimit: number; categories: { category: string; allocated: number }[] } | null;
}

const TABS = ["Overview", "Expenses", "Itinerary", "Budget"];

export default function TripDetailPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("Overview");
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showItineraryModal, setShowItineraryModal] = useState(false);
    const [saving, setSaving] = useState(false);

    const loadTrip = () => {
        fetch(`/api/trips/${id}`)
            .then((r) => r.json())
            .then((data) => { setTrip(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    useEffect(loadTrip, [id]);

    const deleteTrip = async () => {
        if (!confirm("Delete this trip?")) return;
        await fetch(`/api/trips/${id}`, { method: "DELETE" });
        router.push("/trips");
    };

    const deleteExpense = async (eid: string) => {
        await fetch(`/api/expenses/${eid}`, { method: "DELETE" });
        loadTrip();
    };

    const addExpense = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        await fetch("/api/expenses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tripId: id,
                date: fd.get("date"),
                merchant: fd.get("merchant"),
                amount: parseFloat(fd.get("amount") as string),
                currency: trip?.budget?.currency || "USD",
                category: fd.get("category"),
                paymentMethod: fd.get("paymentMethod"),
            }),
        });
        setSaving(false);
        setShowExpenseModal(false);
        loadTrip();
    };

    const addItineraryItem = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData(e.currentTarget);
        await fetch(`/api/trips/${id}/itinerary`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                date: fd.get("date"),
                startTime: fd.get("startTime") || null,
                title: fd.get("title"),
                location: fd.get("location") || null,
                estimatedCost: parseFloat(fd.get("estimatedCost") as string) || 0,
                duration: parseInt(fd.get("duration") as string) || 60,
            }),
        });
        setSaving(false);
        setShowItineraryModal(false);
        loadTrip();
    };

    if (loading) return <div className="skeleton" style={{ height: "200px" }} />;
    if (!trip) return <p>Trip not found</p>;

    const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
    const curr = trip.budget?.currency || "USD";
    const pct = trip.budget ? Math.min((totalSpent / trip.budget.totalBudget) * 100, 100) : 0;
    const pctColor = pct >= 90 ? "var(--danger)" : pct >= 75 ? "var(--warning)" : "var(--success)";

    const categorySpending: Record<string, number> = {};
    trip.expenses.forEach((e) => {
        categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    });

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1100px" }}>
            <Link href="/trips" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", marginBottom: "16px" }}>
                <ArrowLeft size={15} /> Back to trips
            </Link>

            {/* Trip Header */}
            <div className="glass-card" style={{ padding: "22px", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "14px" }}>
                    <div>
                        <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
                            <span className={`badge badge-${trip.status}`}>{trip.status}</span>
                            {trip.purpose !== "leisure" && <span className={`badge badge-${trip.purpose}`}>{trip.purpose}</span>}
                        </div>
                        <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>{trip.name}</h1>
                        <div style={{ display: "flex", gap: "18px", flexWrap: "wrap" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>
                                <MapPin size={14} /> {trip.destination}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>
                                <Calendar size={14} /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>
                                <Clock size={14} /> {getTripDuration(trip.startDate, trip.endDate)} days
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginBottom: "2px" }}>Total Spent</p>
                        <p style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
                            {formatCurrency(totalSpent, curr)}
                        </p>
                        {trip.budget && (
                            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>of {formatCurrency(trip.budget.totalBudget, curr)} budget</p>
                        )}
                    </div>
                </div>
                {trip.budget && (
                    <div style={{ marginTop: "14px" }}>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${pct}%`, background: pctColor }} />
                        </div>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{Math.round(pct)}% of budget used</p>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="tab-nav" style={{ marginBottom: "20px" }}>
                {TABS.map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`tab-item ${tab === t ? "active" : ""}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {tab === "Overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div className="glass-card" style={{ padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px" }}>Spending by Category</h3>
                        {Object.entries(categorySpending).sort((a, b) => b[1] - a[1]).map(([cat, amount]) => (
                            <div key={cat} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{getCategoryIcon(cat)} {getCategoryLabel(cat)}</span>
                                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{formatCurrency(amount, curr)}</span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{
                                        width: `${totalSpent > 0 ? (amount / totalSpent) * 100 : 0}%`,
                                        background: `hsl(${Object.keys(categorySpending).indexOf(cat) * 50}, 65%, 50%)`,
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-card" style={{ padding: "20px" }}>
                        <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px" }}>Recent Expenses</h3>
                        {trip.expenses.slice(0, 5).map((exp) => (
                            <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                <div>
                                    <p style={{ fontSize: "13px", fontWeight: 500 }}>{getCategoryIcon(exp.category)} {exp.merchant}</p>
                                    <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{formatDateShort(exp.date)}</p>
                                </div>
                                <span style={{ fontSize: "13px", fontWeight: 600 }}>{formatCurrency(exp.amount, curr)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Expenses Tab */}
            {tab === "Expenses" && (
                <div>
                    <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                        <button onClick={() => setShowExpenseModal(true)} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <Plus size={15} /> Add Expense
                        </button>
                        {trip.expenses.length > 0 && (
                            <button
                                onClick={() => exportTripPDF(
                                    { name: trip.name, destination: trip.destination, startDate: trip.startDate, endDate: trip.endDate, purpose: trip.purpose, budget: trip.budget },
                                    trip.expenses
                                )}
                                className="btn-ghost"
                                style={{ display: "flex", alignItems: "center", gap: "5px" }}
                            >
                                <FileDown size={15} /> Export PDF
                            </button>
                        )}
                    </div>

                    {trip.expenses.length === 0 ? (
                        <div className="glass-card" style={{ padding: "30px", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No expenses yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {trip.expenses.map((exp) => (
                                <div key={exp.id} className="glass-card" style={{ padding: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>
                                            {getCategoryIcon(exp.category)}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: "13px", fontWeight: 500 }}>{exp.merchant}</p>
                                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{formatDateShort(exp.date)} · {getCategoryLabel(exp.category)}</p>
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
                </div>
            )}

            {/* Itinerary Tab */}
            {tab === "Itinerary" && (
                <div>
                    <button onClick={() => setShowItineraryModal(true)} className="btn-accent" style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "14px" }}>
                        <Plus size={15} /> Add Activity
                    </button>
                    {trip.itinerary.length === 0 ? (
                        <div className="glass-card" style={{ padding: "30px", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No itinerary items yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {trip.itinerary.map((item) => (
                                <div key={item.id} className="glass-card" style={{ padding: "14px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                        <div>
                                            <p style={{ fontSize: "14px", fontWeight: 500 }}>{item.title}</p>
                                            <div style={{ display: "flex", gap: "14px", marginTop: "4px", flexWrap: "wrap" }}>
                                                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>📅 {formatDateShort(item.date)}</span>
                                                {item.startTime && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>🕐 {item.startTime}</span>}
                                                {item.location && <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>📍 {item.location}</span>}
                                            </div>
                                        </div>
                                        {item.estimatedCost > 0 && (
                                            <span style={{ fontSize: "13px", fontWeight: 600 }}>{formatCurrency(item.estimatedCost, curr)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Budget Tab */}
            {tab === "Budget" && (
                <div>
                    {!trip.budget ? (
                        <div className="glass-card" style={{ padding: "30px", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No budget set for this trip</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "20px" }}>
                            {[
                                { label: "Total Budget", value: formatCurrency(trip.budget.totalBudget, curr), color: "var(--accent-primary)" },
                                { label: "Total Spent", value: formatCurrency(totalSpent, curr), color: pctColor },
                                { label: "Remaining", value: formatCurrency(trip.budget.totalBudget - totalSpent, curr), color: "var(--text-primary)" },
                            ].map((s) => (
                                <div key={s.label} className="glass-card" style={{ padding: "18px" }}>
                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>{s.label}</p>
                                    <p style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {trip.budget?.categories && trip.budget.categories.length > 0 && (
                        <div className="glass-card" style={{ padding: "20px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px" }}>Category Budgets</h3>
                            {trip.budget.categories.map((cat) => {
                                const spent = categorySpending[cat.category] || 0;
                                const catPct = cat.allocated > 0 ? Math.min((spent / cat.allocated) * 100, 100) : 0;
                                return (
                                    <div key={cat.category} style={{ marginBottom: "12px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                            <span style={{ fontSize: "13px" }}>{getCategoryIcon(cat.category)} {getCategoryLabel(cat.category)}</span>
                                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                {formatCurrency(spent, curr)} / {formatCurrency(cat.allocated, curr)}
                                            </span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${catPct}%`, background: catPct >= 90 ? "var(--danger)" : catPct >= 75 ? "var(--warning)" : "var(--success)" }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Delete button */}
            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                <button onClick={deleteTrip} className="btn-ghost" style={{ color: "var(--danger)", borderColor: "var(--danger)", display: "flex", alignItems: "center", gap: "5px" }}>
                    <Trash2 size={14} /> Delete Trip
                </button>
            </div>

            {/* Add Expense Modal */}
            {showExpenseModal && (
                <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Add Expense</h3>
                            <button onClick={() => setShowExpenseModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={addExpense}>
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

            {/* Add Itinerary Modal */}
            {showItineraryModal && (
                <div className="modal-backdrop" onClick={() => setShowItineraryModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600 }}>Add Activity</h3>
                            <button onClick={() => setShowItineraryModal(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <form onSubmit={addItineraryItem}>
                            <div style={{ marginBottom: "12px" }}><label className="form-label">Title</label><input name="title" className="input-field" required /></div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                <div><label className="form-label">Date</label><input name="date" type="date" defaultValue={trip.startDate.split("T")[0]} className="input-field" required /></div>
                                <div><label className="form-label">Time</label><input name="startTime" type="time" className="input-field" /></div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                                <div><label className="form-label">Location</label><input name="location" className="input-field" /></div>
                                <div><label className="form-label">Duration (min)</label><input name="duration" type="number" defaultValue={60} className="input-field" /></div>
                            </div>
                            <div style={{ marginBottom: "16px" }}><label className="form-label">Estimated Cost</label><input name="estimatedCost" type="number" step="0.01" defaultValue={0} className="input-field" /></div>
                            <button type="submit" disabled={saving} className="btn-accent" style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                                {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Add Activity"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
