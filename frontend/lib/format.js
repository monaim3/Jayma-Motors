/**
 * Display formats (Step 5 §2.8). The API sends UTC ISO dates and money as
 * strings; everything is shown in Asia/Dhaka time and BDT.
 */
const TIME_ZONE = "Asia/Dhaka";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: TIME_ZONE,
});

const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "2026-11-10" or ISO timestamp → "10 Nov 2026" */
export function formatDate(value) {
  if (!value) return "";
  // Plain dates (no time) are calendar dates, not instants: format without shifting time zones.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00Z`) : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateFormatter.format(date);
}

/** ISO timestamp → "10 Nov 2026, 10:30 am" */
export function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateTimeFormatter.format(date);
}

/** "1250.00" → "৳ 1,250.00" */
export function formatMoney(value) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  return Number.isNaN(amount) ? "" : `৳ ${moneyFormatter.format(amount)}`;
}

/** "+8801711949110" → "01711-949110" */
export function formatPhone(value) {
  if (!value) return "";
  const local = String(value).replace(/^\+?880/, "0");
  return /^01\d{9}$/.test(local) ? `${local.slice(0, 5)}-${local.slice(5)}` : String(value);
}
