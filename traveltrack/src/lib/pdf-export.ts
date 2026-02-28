import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getCategoryLabel } from "@/lib/utils";

interface ExpenseData {
    date: string;
    merchant: string;
    amount: number;
    currency: string;
    category: string;
    paymentMethod: string;
    notes: string | null;
    businessExpense: boolean;
}

interface TripData {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    purpose: string;
    budget?: { totalBudget: number; currency: string } | null;
}

function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtCurrency(amount: number, currency = "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

export function exportTripPDF(trip: TripData, expenses: ExpenseData[]) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("TravelTrack", 16, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Expense Report", 16, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-US")}`, 16, 34);

    // Trip info
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(trip.name, 16, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(`${trip.destination}  |  ${fmtDate(trip.startDate)} — ${fmtDate(trip.endDate)}  |  ${trip.purpose}`, 16, 63);

    // Summary stats
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    const budgetCurrency = trip.budget?.currency || "USD";
    const remaining = trip.budget ? trip.budget.totalBudget - totalSpent : 0;

    doc.setFontSize(10);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");

    const statsY = 75;
    doc.text("Total Spent", 16, statsY);
    doc.text("Budget", 80, statsY);
    doc.text("Remaining", 140, statsY);

    doc.setFont("helvetica", "normal");
    doc.text(fmtCurrency(totalSpent, budgetCurrency), 16, statsY + 7);
    doc.text(trip.budget ? fmtCurrency(trip.budget.totalBudget, budgetCurrency) : "—", 80, statsY + 7);
    doc.text(trip.budget ? fmtCurrency(remaining, budgetCurrency) : "—", 140, statsY + 7);

    // Category breakdown
    const categorySpending: Record<string, number> = {};
    expenses.forEach((e) => {
        categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount;
    });

    let catY = statsY + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Category Breakdown", 16, catY);
    catY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])
        .forEach(([cat, amount]) => {
            const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0;
            doc.setTextColor(107, 114, 128);
            doc.text(getCategoryLabel(cat), 16, catY);
            doc.setTextColor(17, 24, 39);
            doc.text(`${fmtCurrency(amount, budgetCurrency)} (${pct}%)`, 100, catY);
            catY += 6;
        });

    // Expense table
    autoTable(doc, {
        startY: catY + 8,
        head: [["Date", "Merchant", "Category", "Payment", "Amount", "Business"]],
        body: expenses.map((e) => [
            fmtDate(e.date),
            e.merchant,
            getCategoryLabel(e.category),
            e.paymentMethod,
            fmtCurrency(e.amount, e.currency),
            e.businessExpense ? "Yes" : "",
        ]),
        headStyles: { fillColor: [79, 70, 229], fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 249, 251] },
        styles: { cellPadding: 3 },
        margin: { left: 16, right: 16 },
    });

    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(
            `Page ${i} of ${pageCount} — TravelTrack Expense Report`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" }
        );
    }

    doc.save(`${trip.name.replace(/\s+/g, "_")}_expense_report.pdf`);
}

export function exportAllExpensesPDF(expenses: ExpenseData[]) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 32, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("TravelTrack — All Expenses", 16, 16);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${expenses.length} expenses — Generated ${new Date().toLocaleDateString("en-US")}`, 16, 24);

    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: ${fmtCurrency(totalSpent)}`, 16, 45);

    autoTable(doc, {
        startY: 52,
        head: [["Date", "Merchant", "Category", "Payment", "Currency", "Amount"]],
        body: expenses.map((e) => [
            fmtDate(e.date), e.merchant, getCategoryLabel(e.category),
            e.paymentMethod, e.currency, fmtCurrency(e.amount, e.currency),
        ]),
        headStyles: { fillColor: [79, 70, 229], fontSize: 8, fontStyle: "bold" },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [248, 249, 251] },
        margin: { left: 16, right: 16 },
    });

    doc.save("TravelTrack_All_Expenses.pdf");
}
