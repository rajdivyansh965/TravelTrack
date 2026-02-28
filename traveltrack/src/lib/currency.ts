export interface CurrencyInfo {
    code: string;
    name: string;
    symbol: string;
}

export const CURRENCIES: CurrencyInfo[] = [
    { code: "USD", name: "US Dollar", symbol: "$" },
    { code: "EUR", name: "Euro", symbol: "€" },
    { code: "GBP", name: "British Pound", symbol: "£" },
    { code: "JPY", name: "Japanese Yen", symbol: "¥" },
    { code: "AUD", name: "Australian Dollar", symbol: "A$" },
    { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
    { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
    { code: "INR", name: "Indian Rupee", symbol: "₹" },
    { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
    { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
    { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
    { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
    { code: "SEK", name: "Swedish Krona", symbol: "kr" },
    { code: "DKK", name: "Danish Krone", symbol: "kr" },
    { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
    { code: "ZAR", name: "South African Rand", symbol: "R" },
    { code: "BRL", name: "Brazilian Real", symbol: "R$" },
    { code: "KRW", name: "South Korean Won", symbol: "₩" },
    { code: "THB", name: "Thai Baht", symbol: "฿" },
    { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
    { code: "PHP", name: "Philippine Peso", symbol: "₱" },
    { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
    { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
    { code: "PLN", name: "Polish Zloty", symbol: "zł" },
    { code: "TRY", name: "Turkish Lira", symbol: "₺" },
    { code: "RUB", name: "Russian Ruble", symbol: "₽" },
    { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
    { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
    { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
    { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
    { code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
    { code: "CLP", name: "Chilean Peso", symbol: "CLP$" },
    { code: "ARS", name: "Argentine Peso", symbol: "AR$" },
    { code: "COP", name: "Colombian Peso", symbol: "COL$" },
    { code: "EGP", name: "Egyptian Pound", symbol: "E£" },
    { code: "VND", name: "Vietnamese Dong", symbol: "₫" },
    { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
    { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
    { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
    { code: "KES", name: "Kenyan Shilling", symbol: "KSh" },
    { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵" },
    { code: "QAR", name: "Qatari Riyal", symbol: "QR" },
    { code: "KWD", name: "Kuwaiti Dinar", symbol: "KD" },
    { code: "BHD", name: "Bahraini Dinar", symbol: "BD" },
    { code: "OMR", name: "Omani Rial", symbol: "OMR" },
    { code: "JOD", name: "Jordanian Dinar", symbol: "JD" },
    { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
    { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
    { code: "MAD", name: "Moroccan Dirham", symbol: "MAD" },
];

// Mock exchange rates relative to USD
const MOCK_RATES: Record<string, number> = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53, CAD: 1.36,
    CHF: 0.88, CNY: 7.24, INR: 83.1, MXN: 17.15, SGD: 1.34, HKD: 7.82,
    NOK: 10.55, SEK: 10.38, DKK: 6.87, NZD: 1.63, ZAR: 18.63, BRL: 4.97,
    KRW: 1320, THB: 35.2, MYR: 4.72, PHP: 55.8, IDR: 15600, TWD: 31.5,
    PLN: 4.02, TRY: 30.25, RUB: 91.5, AED: 3.67, SAR: 3.75, CZK: 22.8,
    HUF: 355, ILS: 3.63, CLP: 890, ARS: 830, COP: 3950, EGP: 30.9,
    VND: 24400, PKR: 279, BDT: 110, NGN: 1550, KES: 153, GHS: 12.5,
    QAR: 3.64, KWD: 0.308, BHD: 0.376, OMR: 0.385, JOD: 0.709,
    LKR: 325, MMK: 2100, MAD: 10.05,
};

export async function getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;

    // Try to fetch live rates
    try {
        const res = await fetch(
            `https://open.er-api.com/v6/latest/${from}`,
            { next: { revalidate: 43200 } } // Cache for 12 hours
        );
        if (res.ok) {
            const data = await res.json();
            if (data.rates?.[to]) return data.rates[to];
        }
    } catch {
        // Fall back to mock rates
    }

    // Use mock rates as fallback
    const fromRate = MOCK_RATES[from] ?? 1;
    const toRate = MOCK_RATES[to] ?? 1;
    return toRate / fromRate;
}

export function convertCurrency(amount: number, rate: number): number {
    return Math.round(amount * rate * 100) / 100;
}

export function getCurrencySymbol(code: string): string {
    return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatWithCurrency(amount: number, currencyCode: string): string {
    const symbol = getCurrencySymbol(currencyCode);
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
