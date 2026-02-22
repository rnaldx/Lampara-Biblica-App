/**
 * readingTracker.ts
 * Registra automáticamente los capítulos leídos en localStorage.
 * Clave: 'lampara_reading_log'
 */

export interface ReadingEntry {
    date: string;       // ISO date string YYYY-MM-DD
    bookIndex: number;
    chapterIndex: number;
}

const STORAGE_KEY = 'lampara_reading_log';

export function getReadingLog(): ReadingEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as ReadingEntry[];
    } catch {
        return [];
    }
}

/**
 * Registra que el usuario leyó un capítulo hoy.
 * Evita duplicados del mismo día + libro + capítulo.
 */
export function logChapterRead(bookIndex: number, chapterIndex: number): void {
    const today = new Date().toISOString().slice(0, 10);
    const log = getReadingLog();

    // Avoid duplicate entries for same book/chapter/day
    const alreadyLogged = log.some(
        (e) => e.date === today && e.bookIndex === bookIndex && e.chapterIndex === chapterIndex
    );

    if (!alreadyLogged) {
        const newEntry: ReadingEntry = { date: today, bookIndex, chapterIndex };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...log]));
    }
}

/**
 * Devuelve un Set de strings 'YYYY-MM-DD' con días de actividad combinada
 * (notas + lectura).
 */
export function getActiveDates(): Set<string> {
    const log = getReadingLog();
    const dates = new Set<string>(log.map((e) => e.date));
    return dates;
}
