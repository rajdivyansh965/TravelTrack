"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, ReactNode } from "react";
import {
    LayoutDashboard, Map, Receipt, BarChart3, Settings,
    LogOut, Menu, X, Plane, ChevronRight
} from "lucide-react";
import QuickExpense from "@/components/QuickExpense";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/trips", label: "Trips", icon: Map },
    { href: "/expenses", label: "Expenses", icon: Receipt },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-primary)",
            }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{
                        width: "44px", height: "44px", borderRadius: "12px",
                        background: "var(--accent-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 14px",
                    }}>
                        <Plane size={22} color="white" />
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading...</p>
                </div>
            </div>
        );
    }

    if (!session) return null;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.2)",
                        backdropFilter: "blur(2px)", zIndex: 35, display: "none",
                    }}
                    className="mobile-overlay"
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
                <div style={{ padding: "20px 20px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none", color: "var(--text-primary)" }}>
                        <div style={{
                            width: "34px", height: "34px", borderRadius: "10px",
                            background: "var(--accent-primary)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Plane size={17} color="white" />
                        </div>
                        <span style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.3px" }}>
                            Travel<span className="gradient-text">Track</span>
                        </span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        style={{
                            display: "none", background: "none", border: "none", color: "var(--text-muted)",
                            cursor: "pointer", padding: "4px",
                        }}
                        className="mobile-close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column", gap: "1px" }}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight size={14} style={{ marginLeft: "auto", opacity: 0.4 }} />}
                            </Link>
                        );
                    })}
                </nav>

                <div style={{ padding: "14px", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px" }}>
                        <div style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            background: "var(--accent-light)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: 600, color: "var(--accent-primary)",
                        }}>
                            {session.user?.name?.charAt(0) ?? "U"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)" }}>
                                {session.user?.name}
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {session.user?.email}
                            </p>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            style={{
                                background: "none", border: "none", color: "var(--text-muted)",
                                cursor: "pointer", padding: "6px", borderRadius: "6px",
                                transition: "all 0.15s",
                            }}
                            title="Sign out"
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile header */}
            <header style={{
                display: "none", position: "sticky", top: 0, zIndex: 30,
                background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)",
                padding: "12px 16px", alignItems: "center", justifyContent: "space-between",
            }} className="mobile-header">
                <button
                    onClick={() => setSidebarOpen(true)}
                    style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }}
                >
                    <Menu size={22} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Plane size={17} style={{ color: "var(--accent-primary)" }} />
                    <span style={{ fontSize: "15px", fontWeight: 600 }}>TravelTrack</span>
                </div>
                <div style={{ width: "22px" }} />
            </header>

            {/* Main content */}
            <main
                className="main-content"
                style={{ marginLeft: "260px", minHeight: "100vh", padding: "28px 32px" }}
            >
                {children}
            </main>

            {/* Bottom tabs (mobile) */}
            <nav className="bottom-tabs">
                {NAV_ITEMS.slice(0, 5).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-tab-item ${isActive ? "active" : ""}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Quick Expense FAB */}
            <QuickExpense />

            <style jsx global>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
          .mobile-close { display: block !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
        </div>
    );
}
