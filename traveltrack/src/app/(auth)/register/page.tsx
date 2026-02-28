"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Plane, Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        register: reg,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterInput) => {
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const result = await res.json();
                setError(result.error || "Registration failed");
                setLoading(false);
                return;
            }

            await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            });

            router.push("/dashboard");
        } catch {
            setError("Something went wrong");
            setLoading(false);
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
            <div style={{ width: "100%", maxWidth: "400px" }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "28px" }}>
                    <div style={{
                        width: "48px", height: "48px", borderRadius: "14px",
                        background: "var(--accent-primary)",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "14px",
                    }}>
                        <Plane size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
                        Create your account
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                        Start tracking your travels
                    </p>
                </div>

                {/* Form Card */}
                <div style={{
                    background: "white", borderRadius: "16px", padding: "28px",
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

                        <div style={{ marginBottom: "14px" }}>
                            <label className="form-label">Full Name</label>
                            <div style={{ position: "relative" }}>
                                <User size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input {...reg("name")} placeholder="Your name" className="input-field" style={{ paddingLeft: "38px" }} />
                            </div>
                            {errors.name && <p className="error-text">{errors.name.message}</p>}
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label className="form-label">Email</label>
                            <div style={{ position: "relative" }}>
                                <Mail size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input {...reg("email")} type="email" placeholder="you@example.com" className="input-field" style={{ paddingLeft: "38px" }} />
                            </div>
                            {errors.email && <p className="error-text">{errors.email.message}</p>}
                        </div>

                        <div style={{ marginBottom: "14px" }}>
                            <label className="form-label">Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input {...reg("password")} type="password" placeholder="Min 6 characters" className="input-field" style={{ paddingLeft: "38px" }} />
                            </div>
                            {errors.password && <p className="error-text">{errors.password.message}</p>}
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label className="form-label">Confirm Password</label>
                            <div style={{ position: "relative" }}>
                                <Lock size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input {...reg("confirmPassword")} type="password" placeholder="Re-enter password" className="input-field" style={{ paddingLeft: "38px" }} />
                            </div>
                            {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
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
                                <>Create Account <ArrowRight size={16} /></>
                            )}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginTop: "20px" }}>
                    Already have an account?{" "}
                    <Link href="/login" style={{ color: "var(--accent-primary)", fontWeight: 500, textDecoration: "none" }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
