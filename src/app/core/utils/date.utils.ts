/** "1990-05-12" -> Date at local midnight (avoids the UTC off-by-one bug). */
export function parseIsoDate(value: string | null): Date | null {
    if (!value) 
        return null;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

/** Date -> "yyyy-MM-dd" using local date parts. */
export function toIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}