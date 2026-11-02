/** Parses "dd/mm/yyyy" (or "dd/mm/yy") into a Date at local midnight; null when invalid. */
export const parseDayInput = (value: string): Date | null => {
  const match = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(value.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  let year = Number(match[3]);
  if (year < 100) year += year > 50 ? 1900 : 2000;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

/** Accepts "HH:mm" in 24h time; returns [hours, minutes] or null. */
export const parseTimeInput = (value: string): [number, number] | null => {
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  return match ? [Number(match[1]), Number(match[2])] : null;
};

export const toDayInput = (value?: string | Date) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

/** ISO date (yyyy-mm-dd) used by the clinical tables, e.g. "2026-09-14". */
export const isoDay = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Short "12/10/26" style used by the lab and culture tables. */
export const shortDay = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)}`;
};

export const formatDayMonth = (value: string | Date) => {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export const longDay = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export const clockTime = (value: string | Date) => {
  const d = new Date(value);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** "7:00 AM" from "07:00". */
export const twelveHour = (hhmm = "07:00") => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole days from today to the given date (0 = today, 1 = tomorrow, negative = overdue). */
export const daysFromToday = (value: string | Date) =>
  Math.round((startOfDay(new Date(value)).getTime() - startOfDay(new Date()).getTime()) / 86400000);

/**
 * Daily clinical review resets at 07:00 local time: a review counts as "today" when it was
 * made after the most recent 07:00.
 */
export const isReviewedToday = (lastReviewedAt?: string, resetHour = 7) => {
  if (!lastReviewedAt) return false;
  const now = new Date();
  const reset = new Date(now.getFullYear(), now.getMonth(), now.getDate(), resetHour);
  if (now < reset) reset.setDate(reset.getDate() - 1);
  return new Date(lastReviewedAt) >= reset;
};

export const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
};
