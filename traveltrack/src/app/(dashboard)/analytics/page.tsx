"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { formatCurrency, getCategoryIcon, getCategoryLabel } from "@/lib/utils";
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts";

interface Expense {
    amount: number;
    currency: string;
    category: string;
    date: string;
    merchant: string;
}

interface Trip {
    id: string;
    name: string;
    budget: { totalBudget: number; currency: string } | null;
    expenses: Expense[];
}

const COLORS = ["#4f46e5", "#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ef4444"];

export default function AnalyticsPage() {
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/trips").then((r) => r.json()).then((data) => { setTrips(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const allExpenses = trips.flatMap((t) => t.expenses);
    const totalSpent = allExpenses.reduce((s, e) => s + e.amount, 0);

    // Category data
    const catMap: Record<string, number> = {};
    allExpenses.forEach((e) => { catMap[e.category] = (catMap[e.category] || 0) + e.amount; });
    const categoryData = Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({
        name: getCategoryLabel(name),
        icon: getCategoryIcon(name),
        value,
    }));

    // Trip comparison data
    const tripComparison = trips.filter((t) => t.budget).map((t) => ({
        name: t.name.length > 16 ? t.name.slice(0, 16) + "..." : t.name,
        budget: t.budget?.totalBudget || 0,
        spent: t.expenses.reduce((s, e) => s + e.amount, 0),
    }));

    // Daily spending trend
    const dailyMap: Record<string, number> = {};
    allExpenses.forEach((e) => {
        const day = new Date(e.date).toISOString().split("T")[0];
        dailyMap[day] = (dailyMap[day] || 0) + e.amount;
    });
    const dailyData = Object.entries(dailyMap).sort().map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        amount,
    }));

    // Monthly spending
    const monthlyMap: Record<string, number> = {};
    allExpenses.forEach((e) => {
        const m = new Date(e.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlyMap[m] = (monthlyMap[m] || 0) + e.amount;
    });
    const monthlyData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));

    // Top merchants
    const merchantMap: Record<string, number> = {};
    allExpenses.forEach((e) => { merchantMap[e.merchant] = (merchantMap[e.merchant] || 0) + e.amount; });
    const topMerchants = Object.entries(merchantMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (loading) return <div className="skeleton" style={{ height: "200px" }} />;

    const avgDaily = dailyData.length > 0 ? totalSpent / dailyData.length : 0;

    return (
        <div className="animate-fade-in" style={{ maxWidth: "1100px" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ fontSize: "22px", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px" }}>
                    <BarChart3 size={22} style={{ color: "var(--accent-primary)" }} /> Analytics & Insights
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginTop: "3px" }}>Your travel spending at a glance</p>
            </div>

            {/* Overview Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "14px", marginBottom: "24px" }}>
                {[
                    { label: "Total Spent", value: formatCurrency(totalSpent) },
                    { label: "Total Expenses", value: allExpenses.length.toString() },
                    { label: "Avg Daily", value: formatCurrency(avgDaily) },
                    { label: "Categories", value: Object.keys(catMap).length.toString() },
                ].map((s) => (
                    <div key={s.label} className="glass-card" style={{ padding: "16px" }}>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>{s.label}</p>
                        <p style={{ fontSize: "20px", fontWeight: 700 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Spending by Category */}
                <div className="glass-card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Spending by Category</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <ResponsiveContainer width="50%" height={200}>
                            <PieChart>
                                <Pie data={categoryData} innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                                    formatter={(value) => formatCurrency(Number(value ?? 0))}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                            {categoryData.map((c, i) => (
                                <div key={c.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
                                        <span style={{ width: "8px", height: "8px", borderRadius: "2px", background: COLORS[i % COLORS.length], display: "inline-block" }} />
                                        {c.name}
                                    </span>
                                    <span style={{ fontSize: "12px", fontWeight: 600 }}>{formatCurrency(c.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trip Spending vs Budget */}
                <div className="glass-card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Trip Spending vs Budget</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={tripComparison}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                            <YAxis fontSize={11} stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                                formatter={(value) => formatCurrency(Number(value ?? 0))}
                            />
                            <Bar dataKey="budget" fill="#e0e7ff" name="Budget" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="spent" fill="#4f46e5" name="Spent" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Daily Spending Trend */}
            <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Daily Spending Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" fontSize={11} stroke="#9ca3af" />
                        <YAxis fontSize={11} stroke="#9ca3af" />
                        <Tooltip
                            contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                            formatter={(value) => formatCurrency(Number(value ?? 0))}
                        />
                        <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="amount" stroke="#4f46e5" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Monthly Spending */}
                <div className="glass-card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Monthly Spending</h3>
                    <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="month" fontSize={11} stroke="#9ca3af" />
                            <YAxis fontSize={11} stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                                formatter={(value) => formatCurrency(Number(value ?? 0))}
                            />
                            <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Merchants */}
                <div className="glass-card" style={{ padding: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "14px" }}>Top Merchants</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {topMerchants.map(([name, amount], i) => (
                            <div key={name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg-muted)", borderRadius: "8px" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
                                    <span style={{
                                        width: "22px", height: "22px", borderRadius: "6px",
                                        background: COLORS[i % COLORS.length], color: "white",
                                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700,
                                    }}>{i + 1}</span>
                                    {name}
                                </span>
                                <span style={{ fontWeight: 600, fontSize: "13px" }}>{formatCurrency(amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
