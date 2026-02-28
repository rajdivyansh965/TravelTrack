import { getCategoryLabel } from "@/lib/utils";

interface ExpenseData {
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
    trip?: { name: string; destination?: string };
}

interface TripExport {
    id: string;
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    purpose: string;
    status: string;
}

function downloadFile(content: string, filename: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportExpensesCSV(expenses: ExpenseData[]) {
    const header = "Date,Merchant,Amount,Currency,Category,Payment Method,Business,Reimbursable,Notes,Trip\n";
    const rows = expenses.map((e) =>
        [
            new Date(e.date).toISOString().split("T")[0],
            `"${e.merchant.replace(/"/g, '""')}"`,
            e.amount.toFixed(2),
            e.currency,
            `"${getCategoryLabel(e.category)}"`,
            e.paymentMethod,
            e.businessExpense ? "Yes" : "No",
            e.reimbursable ? "Yes" : "No",
            `"${(e.notes || "").replace(/"/g, '""')}"`,
            `"${e.trip?.name || ""}"`,
        ].join(",")
    ).join("\n");

    downloadFile(header + rows, `TravelTrack_Expenses_${new Date().toISOString().split("T")[0]}.csv`, "text/csv");
}

export function exportAllDataJSON(trips: TripExport[], expenses: ExpenseData[]) {
    const data = {
        exportedAt: new Date().toISOString(),
        app: "TravelTrack",
        summary: {
            totalTrips: trips.length,
            totalExpenses: expenses.length,
            totalSpent: expenses.reduce((s, e) => s + e.amount, 0),
        },
        trips,
        expenses: expenses.map((e) => ({
            ...e,
            category: getCategoryLabel(e.category),
        })),
    };

    downloadFile(
        JSON.stringify(data, null, 2),
        `TravelTrack_Export_${new Date().toISOString().split("T")[0]}.json`,
        "application/json"
    );
}
