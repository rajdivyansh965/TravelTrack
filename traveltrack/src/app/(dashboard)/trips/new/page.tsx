"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripSchema, type TripInput } from "@/lib/validations";
import { ArrowLeft, MapPin, Calendar, Briefcase, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import { TRIP_PURPOSES } from "@/lib/utils";

export default function NewTripPage() {
    const router = useRouter();
    const [saving, setSaving] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<TripInput>({
        resolver: zodResolver(tripSchema),
        defaultValues: { purpose: "leisure" },
    });

    const onSubmit = async (data: TripInput) => {
        setSaving(true);
        const res = await fetch("/api/trips", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            const trip = await res.json();
            router.push(`/trips/${trip.id}`);
        }
        setSaving(false);
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: "560px" }}>
            <Link href="/trips" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--text-secondary)", textDecoration: "none", fontSize: "13px", marginBottom: "20px" }}>
                <ArrowLeft size={15} /> Back to trips
            </Link>

            <h1 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>New Trip</h1>

            <div className="glass-card" style={{ padding: "28px" }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div style={{ marginBottom: "16px" }}>
                        <label className="form-label">Trip Name</label>
                        <div style={{ position: "relative" }}>
                            <Briefcase size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input {...register("name")} placeholder="e.g. Paris Business Trip" className="input-field" style={{ paddingLeft: "36px" }} />
                        </div>
                        {errors.name && <p className="error-text">{errors.name.message}</p>}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label className="form-label">Destination</label>
                        <div style={{ position: "relative" }}>
                            <MapPin size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                            <input {...register("destination")} placeholder="City, Country" className="input-field" style={{ paddingLeft: "36px" }} />
                        </div>
                        {errors.destination && <p className="error-text">{errors.destination.message}</p>}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                        <div>
                            <label className="form-label">Start Date</label>
                            <div style={{ position: "relative" }}>
                                <Calendar size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input {...register("startDate")} type="date" className="input-field" style={{ paddingLeft: "36px" }} />
                            </div>
                            {errors.startDate && <p className="error-text">{errors.startDate.message}</p>}
                        </div>
                        <div>
                            <label className="form-label">End Date</label>
                            <div style={{ position: "relative" }}>
                                <Calendar size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                                <input {...register("endDate")} type="date" className="input-field" style={{ paddingLeft: "36px" }} />
                            </div>
                            {errors.endDate && <p className="error-text">{errors.endDate.message}</p>}
                        </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label className="form-label">Purpose</label>
                        <select {...register("purpose")} className="select-field">
                            {TRIP_PURPOSES.map((p) => (
                                <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label className="form-label">Notes (optional)</label>
                        <div style={{ position: "relative" }}>
                            <FileText size={15} style={{ position: "absolute", left: "12px", top: "14px", color: "var(--text-muted)" }} />
                            <textarea {...register("notes")} placeholder="Trip notes..." className="input-field" rows={3} style={{ paddingLeft: "36px", resize: "vertical" }} />
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                        <Link href="/trips" className="btn-ghost" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
                            Cancel
                        </Link>
                        <button type="submit" disabled={saving} className="btn-accent" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                            {saving ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : "Create Trip"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
