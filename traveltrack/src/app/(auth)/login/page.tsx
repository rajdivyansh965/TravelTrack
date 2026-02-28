"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Plane, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginInput) => {
        setLoading(true);
        setError("");

        const result = await signIn("credentials", {
            redirect: false,
            email: data.email,
            password: data.password,
        });

        if (result?.error) {
            setError("Invalid email or password");
            setLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #fff1f2 100%)",
            padding: "24px",
        }}>
            <div style={{
                width: "100%",
                maxWidth: "400px",
            }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "14px",
                        background: "var(--accent-primary)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "16px",
                    }}>
                        <Plane size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
                        Welcome back
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                        Sign in to your TravelTrack account
                    </p>
                </div>

                {/* Form Card */}
                <div style={{
                    background: "white",
                    borderRadius: "16px",
                    padding: "28px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
                    border: "1px solid #e5e7eb",
                }}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div style={{
                                padding: "10px 14px", borderRadius: "8px",
                                background: "#fef2f2", border: "1px solid #fecaca",
                                color: "#dc2626", fontSize: "13px", marginBottom: "18px",
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ marginBottom: "16px" }}>
                            <label className="form-label">Email</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input
                                    {...register("email")}
                                    type="email"
                                    placeholder="you@example.com"
                                    className="input-field"
                                    style={{ paddingLeft: "38px" }}
                                />
                            </div>
                            {errors.email && <p className="error-text">{errors.email.message}</p>}
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label className="form-label">Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input
                                    {...register("password")}
                                    type="password"
                                    placeholder="••••••••"
                                    className="input-field"
                                    style={{ paddingLeft: "38px" }}
                                />
                            </div>
                            {errors.password && <p className="error-text">{errors.password.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-accent"
                            style={{
                                width: "100%", padding: "11px", fontSize: "14px",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            }}
                        >
                            {loading ? (
                                <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                            ) : (
                                <>Sign In <ArrowRight size={16} /></>
                            )}
                        </button>

                        <p style={{
                            textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "14px",
                        }}>
                            Demo: <span style={{ color: "var(--accent-primary)" }}>demo@traveltrack.app</span> / <span style={{ color: "var(--accent-primary)" }}>demo1234</span>
                        </p>
                    </form>
                </div>

                <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
                    Don&apos;t have an account?{" "}
                    <Link href="/register" style={{ color: "var(--accent-primary)", fontWeight: 500, textDecoration: "none" }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}
