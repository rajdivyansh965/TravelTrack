"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, MapPin, Calendar, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate, getTripDuration, getPercentage } from "@/lib/utils";

interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    purpose: string;
    status: string;
    budget: { totalBudget: number; currency: string } | null;
    expenses: { amount: number }[];
    _count: { expenses: number };
}

const STATUS_TABS = ["all", "active", "planning", "completed"] as const;

export default function TripsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        fetch("/api/trips")
            .then((r) => r.json())
            .then((data) => { setTrips(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = trips.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.destination.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || t.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="skeleton" style={{ height: "200px", width: "100%" }} />;

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1100px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    <h1 style={{ fontSize: "22px", fontWeight: 700 }}>My Trips</h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "3px" }}>{trips.length} trips total</p>
                </div>
                <Link href="/trips/new" className="btn-accent" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                    <Plus size={15} /> New Trip
                </Link>
            </div>

            {/* Search + Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
                    <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search trips..."
                        className="input-field"
                        style={{ paddingLeft: "36px" }}
                    />
                </div>
                <div className="tab-nav" style={{ height: "fit-content" }}>
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setStatusFilter(tab)}
                            className={`tab-item ${statusFilter === tab ? "active" : ""}`}
                            style={{ padding: "8px 14px" }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Trips Grid */}
            {filtered.length === 0 ? (
                <div className="glass-card" style={{ padding: "40px", textAlign: "center" }}>
                    <p style={{ color: "var(--text-muted)", marginBottom: "12px" }}>No trips found</p>
                    <Link href="/trips/new" style={{ color: "var(--accent-primary)", textDecoration: "none", fontSize: "13px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        Create your first trip <ArrowRight size={13} />
                    </Link>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "14px" }}>
                    {filtered.map((trip, i) => {
                        const totalSpent = trip.expenses.reduce((s, e) => s + e.amount, 0);
                        const pct = trip.budget ? getPercentage(totalSpent, trip.budget.totalBudget) : 0;
                        const budgetColor = pct >= 90 ? "var(--danger)" : pct >= 75 ? "var(--warning)" : "var(--success)";
                        return (
                            <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                <div className="glass-card animate-slide-up" style={{ padding: "20px", opacity: 0, animationDelay: `${i * 0.06}s` }}>
                                    <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
                                        <span className={`badge badge-${trip.status}`}>{trip.status}</span>
                                        {trip.purpose !== "leisure" && <span className={`badge badge-${trip.purpose}`}>{trip.purpose}</span>}
                                    </div>
                                    <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>{trip.name}</h3>
                                    <div style={{ display: "flex", gap: "14px", marginBottom: "14px", flexWrap: "wrap" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                            <MapPin size={12} /> {trip.destination}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                            <Calendar size={12} /> {formatDate(trip.startDate)} — {formatDate(trip.endDate)} · {getTripDuration(trip.startDate, trip.endDate)}d
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{trip._count.expenses} expenses</span>
                                        <span style={{ fontSize: "15px", fontWeight: 600 }}>
                                            {formatCurrency(totalSpent, trip.budget?.currency)}
                                        </span>
                                    </div>
                                    {trip.budget && (
                                        <>
                                            <div className="progress-bar">
                                                <div className="progress-fill" style={{ width: `${pct}%`, background: budgetColor }} />
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{pct}% used</span>
                                                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Budget: {formatCurrency(trip.budget.totalBudget, trip.budget.currency)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
