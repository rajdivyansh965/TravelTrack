"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { User, Globe, Bell, Tag, Download, Loader2, Check } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { EXPENSE_CATEGORIES, getCategoryIcon } from "@/lib/utils";
import { exportExpensesCSV, exportAllDataJSON } from "@/lib/data-export";

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
    reimbursable: boolean;
    trip?: { name: string };
}

interface Trip {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    purpose: string;
    status: string;
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const [currency, setCurrency] = useState("USD");
    const [notifications, setNotifications] = useState({
        budgetAlerts: true,
        tripReminders: true,
        weeklyReport: false,
    });
    const [saved, setSaved] = useState(false);
    const [exporting, setExporting] = useState<string | null>(null);

    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);

    useEffect(() => {
        Promise.all([
            fetch("/api/expenses").then((r) => r.json()),
            fetch("/api/trips").then((r) => r.json()),
        ]).then(([exp, trp]) => {
            setExpenses(exp);
            setTrips(trp);
        }).catch(() => { });
    }, []);

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleExportCSV = async () => {
        setExporting("csv");
        try { exportExpensesCSV(expenses); } catch { }
        setTimeout(() => setExporting(null), 1000);
    };

    const handleExportJSON = async () => {
        setExporting("json");
        try { exportAllDataJSON(trips, expenses); } catch { }
        setTimeout(() => setExporting(null), 1000);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: "640px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Settings</h1>

            {/* Profile */}
            <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <User size={16} style={{ color: "var(--accent-primary)" }} />
                    <h2 style={{ fontSize: "14px", fontWeight: 600 }}>Profile</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                        <label className="form-label">Name</label>
                        <input defaultValue={session?.user?.name ?? ""} className="input-field" readOnly style={{ background: "var(--bg-muted)" }} />
                    </div>
                    <div>
                        <label className="form-label">Email</label>
                        <input defaultValue={session?.user?.email ?? ""} className="input-field" readOnly style={{ background: "var(--bg-muted)" }} />
                    </div>
                </div>
            </div>

            {/* Default Currency */}
            <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Globe size={16} style={{ color: "var(--accent-primary)" }} />
                    <h2 style={{ fontSize: "14px", fontWeight: 600 }}>Default Currency</h2>
                </div>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="select-field">
                    {CURRENCIES.slice(0, 30).map((c) => (
                        <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.name}</option>
                    ))}
                </select>
            </div>

            {/* Notifications */}
            <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <Bell size={16} style={{ color: "var(--accent-primary)" }} />
                    <h2 style={{ fontSize: "14px", fontWeight: 600 }}>Notifications</h2>
                </div>
                {[
                    { key: "budgetAlerts", label: "Budget alerts", desc: "Notify when approaching budget limits" },
                    { key: "tripReminders", label: "Trip reminders", desc: "Upcoming trip notifications" },
                    { key: "weeklyReport", label: "Weekly report", desc: "Email summary of spending" },
                ].map((item) => (
                    <div key={item.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                            <p style={{ fontSize: "13px", fontWeight: 500 }}>{item.label}</p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{item.desc}</p>
                        </div>
                        <label style={{ position: "relative", display: "inline-block", width: "40px", height: "22px", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={notifications[item.key as keyof typeof notifications]}
                                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                style={{ opacity: 0, width: 0, height: 0 }}
                            />
                            <span style={{
                                position: "absolute", inset: 0, borderRadius: "11px",
                                background: notifications[item.key as keyof typeof notifications] ? "var(--accent-primary)" : "#d1d5db",
                                transition: "background 0.2s",
                            }}>
                                <span style={{
                                    position: "absolute", left: notifications[item.key as keyof typeof notifications] ? "20px" : "2px", top: "2px",
                                    width: "18px", height: "18px", borderRadius: "50%", background: "white",
                                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                }} />
                            </span>
                        </label>
                    </div>
                ))}
            </div>

            {/* Expense Categories */}
            <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Tag size={16} style={{ color: "var(--accent-primary)" }} />
                    <h2 style={{ fontSize: "14px", fontWeight: 600 }}>Expense Categories</h2>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {EXPENSE_CATEGORIES.map((cat) => (
                        <span key={cat.value} style={{
                            display: "inline-flex", alignItems: "center", gap: "5px",
                            padding: "5px 10px", borderRadius: "7px", background: "var(--bg-muted)",
                            fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500,
                        }}>
                            {getCategoryIcon(cat.value)} {cat.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Data Export */}
            <div className="glass-card" style={{ padding: "20px", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                    <Download size={16} style={{ color: "var(--accent-primary)" }} />
                    <h2 style={{ fontSize: "14px", fontWeight: 600 }}>Export Data</h2>
                </div>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "14px" }}>
                    Download your data for backup or import into other tools.
                    {expenses.length > 0 && ` (${expenses.length} expenses, ${trips.length} trips)`}
                </p>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button
                        onClick={handleExportCSV}
                        disabled={exporting === "csv" || expenses.length === 0}
                        className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                        {exporting === "csv" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
                        Export CSV
                    </button>
                    <button
                        onClick={handleExportJSON}
                        disabled={exporting === "json" || (expenses.length === 0 && trips.length === 0)}
                        className="btn-ghost"
                        style={{ display: "flex", alignItems: "center", gap: "5px" }}
                    >
                        {exporting === "json" ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Download size={14} />}
                        Export JSON
                    </button>
                </div>
            </div>

            {/* Save button */}
            <button onClick={handleSave} className="btn-accent" style={{
                width: "100%", padding: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            }}>
                {saved ? <><Check size={16} /> Saved</> : "Save Settings"}
            </button>
        </div>
    );
}
