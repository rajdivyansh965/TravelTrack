"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Plane, Plus, ArrowRight, MapPin, Calendar, DollarSign,
    TrendingUp, Clock, Receipt, Lightbulb, ArrowUpRight
} from "lucide-react";
import { formatCurrency, formatDate, getDaysRemaining, getTripDuration, getCategoryLabel, getCategoryIcon } from "@/lib/utils";
import CurrencyConverter from "@/components/CurrencyConverter";

interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    purpose: string;
    status: string;
    budget: { totalBudget: number; currency: string } | null;
    expenses: { amount: number; currency: string; category: string }[];
    _count: { expenses: number; itinerary: number };
}

export default function DashboardPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/trips")
            .then((r) => r.json())
            .then((data) => { setTrips(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const activeTrip = trips.find((t) => t.status === "active");
    const upcomingTrips = trips.filter((t) => t.status === "planning");
    const completedTrips = trips.filter((t) => t.status === "completed");
    const allExpenses = trips.flatMap((t) => t.expenses);
    const totalSpent = allExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTrips = trips.length;

    // Smart Insights
    const categorySpending: Record<string, number> = {};
    allExpenses.forEach((e) => {
        categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    });
    const topCategory = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])[0];
    const avgPerTrip = totalTrips > 0 ? totalSpent / totalTrips : 0;
    const totalBudget = trips.reduce((s, t) => s + (t.budget?.totalBudget || 0), 0);
    const budgetUtil = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "100px", width: "100%" }} />
                ))}
            </div>
        );
    }

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1100px" }}>
            {/* Header */}
            <div style={{ marginBottom: "28px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 700, letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"} 👋
                </h1>
                <p style={{ color: "var(--text-secondary)", marginTop: "4px", fontSize: "14px" }}>
                    Here&apos;s your travel overview
                </p>
            </div>

            {/* Quick Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                {[
                    { label: "Total Trips", value: totalTrips.toString(), icon: Plane, color: "#4f46e5", bg: "#eef2ff" },
                    { label: "Active Trips", value: (activeTrip ? 1 : 0).toString(), icon: TrendingUp, color: "#059669", bg: "#ecfdf5" },
                    { label: "Total Spent", value: formatCurrency(totalSpent), icon: DollarSign, color: "#d97706", bg: "#fffbeb" },
                    { label: "Upcoming", value: upcomingTrips.length.toString(), icon: Clock, color: "#2563eb", bg: "#eff6ff" },
                ].map((stat) => (
                    <div key={stat.label} className="glass-card" style={{ padding: "18px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>{stat.label}</span>
                            <div style={{
                                width: "32px", height: "32px", borderRadius: "8px",
                                background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                                <stat.icon size={16} style={{ color: stat.color }} />
                            </div>
                        </div>
                        <span style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
                <Link href="/trips/new" className="btn-accent" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                    <Plus size={15} /> New Trip
                </Link>
                <Link href="/expenses" className="btn-ghost" style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}>
                    <Receipt size={15} /> View Expenses
                </Link>
            </div>

            {/* Active Trip */}
            {activeTrip && (
                <div style={{ marginBottom: "24px" }}>
                    <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        🟢 Active Trip
                    </h2>
                    <Link href={`/trips/${activeTrip.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="glass-card" style={{ padding: "22px", borderLeft: "3px solid var(--accent-primary)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: "14px" }}>
                                <div>
                                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px", color: "var(--text-primary)" }}>{activeTrip.name}</h3>
                                    <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>
                                            <MapPin size={13} /> {activeTrip.destination}
                                        </span>
                                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "var(--text-secondary)" }}>
                                            <Calendar size={13} /> {formatDate(activeTrip.startDate)} - {formatDate(activeTrip.endDate)}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Spent</p>
                                    <p style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>
                                        {formatCurrency(activeTrip.expenses.reduce((s, e) => s + e.amount, 0), activeTrip.budget?.currency)}
                                    </p>
                                    {activeTrip.budget && (
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                            of {formatCurrency(activeTrip.budget.totalBudget, activeTrip.budget.currency)} budget
                                        </p>
                                    )}
                                </div>
                            </div>
                            {activeTrip.budget && (() => {
                                const spent = activeTrip.expenses.reduce((s, e) => s + e.amount, 0);
                                const pct = Math.min((spent / activeTrip.budget.totalBudget) * 100, 100);
                                const color = pct >= 90 ? "var(--danger)" : pct >= 75 ? "var(--warning)" : "var(--success)";
                                return (
                                    <div style={{ marginTop: "14px" }}>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                                        </div>
                                        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "5px" }}>{Math.round(pct)}% of budget used</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </Link>
                </div>
            )}

            {/* Smart Insights + Currency Converter */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                {/* Smart Insights */}
                <div className="glass-card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                        <Lightbulb size={16} style={{ color: "var(--warning)" }} />
                        <h3 style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>Smart Insights</h3>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {topCategory && (
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg-muted)", borderRadius: "8px" }}>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                                    Top: {getCategoryIcon(topCategory[0])} {getCategoryLabel(topCategory[0])}
                                </span>
                                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                                    {formatCurrency(topCategory[1])} <span style={{ fontSize: "11px", fontWeight: 400, color: "var(--text-muted)" }}>({totalSpent > 0 ? Math.round((topCategory[1] / totalSpent) * 100) : 0}%)</span>
                                </span>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg-muted)", borderRadius: "8px" }}>
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Avg per trip</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{formatCurrency(avgPerTrip)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg-muted)", borderRadius: "8px" }}>
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Budget utilization</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: budgetUtil > 80 ? "var(--danger)" : "var(--text-primary)" }}>{budgetUtil}%</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg-muted)", borderRadius: "8px" }}>
                            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Categories used</span>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{Object.keys(categorySpending).length}</span>
                        </div>
                    </div>
                </div>

                {/* Currency Converter */}
                <CurrencyConverter />
            </div>

            {/* Upcoming & Recent */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                    <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Upcoming Trips
                    </h2>
                    {upcomingTrips.length === 0 ? (
                        <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No upcoming trips</p>
                            <Link href="/trips/new" style={{ color: "var(--accent-primary)", fontSize: "12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                                Plan one <ArrowRight size={12} />
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {upcomingTrips.map((trip) => (
                                <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <div className="glass-card" style={{ padding: "14px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <h4 style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{trip.name}</h4>
                                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                                                    <MapPin size={11} /> {trip.destination}
                                                </p>
                                            </div>
                                            <div style={{ textAlign: "right" }}>
                                                <span className="badge badge-planning">{getDaysRemaining(trip.startDate)}d</span>
                                                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{getTripDuration(trip.startDate, trip.endDate)} days</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Recent Trips
                    </h2>
                    {completedTrips.length === 0 ? (
                        <div className="glass-card" style={{ padding: "24px", textAlign: "center" }}>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>No completed trips yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {completedTrips.slice(0, 3).map((trip) => (
                                <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                    <div className="glass-card" style={{ padding: "14px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <h4 style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-primary)" }}>{trip.name}</h4>
                                                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                                                    {trip.destination} · {trip._count.expenses} expenses
                                                </p>
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                                                    {formatCurrency(trip.expenses.reduce((s, e) => s + e.amount, 0), trip.budget?.currency)}
                                                </span>
                                                <ArrowUpRight size={14} style={{ color: "var(--text-muted)" }} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
