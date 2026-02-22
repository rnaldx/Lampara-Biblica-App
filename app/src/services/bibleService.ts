export const BIBLE_BOOKS = [
    "Génesis", "Éxodo", "Levítico", "Números", "Deuteronomio", "Josué", "Jueces", "Rut",
    "1 Samuel", "2 Samuel", "1 Reyes", "2 Reyes", "1 Crónicas", "2 Crónicas", "Esdras",
    "Nehemías", "Ester", "Job", "Salmos", "Proverbios", "Eclesiastés", "Cantares",
    "Isaías", "Jeremías", "Lamentaciones", "Ezequiel", "Daniel", "Oseas", "Joel", "Amós",
    "Abdías", "Jonás", "Miqueas", "Nahúm", "Habacuc", "Sofonías", "Hageo", "Zacarías", "Malaquías",
    "Mateo", "Marcos", "Lucas", "Juan", "Hechos", "Romanos", "1 Corintios", "2 Corintios",
    "Gálatas", "Efesios", "Filipenses", "Colosenses", "1 Tesalonicenses", "2 Tesalonicenses",
    "1 Timoteo", "2 Timoteo", "Tito", "Filemón", "Hebreos", "Santiago", "1 Pedro", "2 Pedro",
    "1 Juan", "2 Juan", "3 Juan", "Judas", "Apocalipsis"
];

let bibleCache: any = null;

export const fetchBible = async () => {
    if (bibleCache) return bibleCache;
    try {
        const response = await fetch('/bible_es.json');
        const data = await response.json();
        bibleCache = data;
        return data;
    } catch (error) {
        console.error("Error loading Bible JSON", error);
        return null;
    }
};

export const getChapter = async (bookIndex: number, chapterIndex: number) => {
    const bible = await fetchBible();
    if (!bible || !bible[bookIndex]) return [];

    // chapters are 0-indexed in the array, but user sees 1-indexed
    const chapterVerses = bible[bookIndex].chapters[chapterIndex];
    if (!chapterVerses) return [];

    return chapterVerses.map((text: string, idx: number) => ({
        n: idx + 1,
        text
    }));
};
