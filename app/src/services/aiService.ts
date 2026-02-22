/**
 * aiService.ts
 * Llama a la API de Google Gemini para analizar palabras bíblicas en contexto.
 * Requiere VITE_GEMINI_API_KEY en tu archivo .env.local
 */

export type AIWordAnalysis = {
    original: string;
    transliteration: string;
    pronunciation: string;
    type: string;
    case: string;
    gender: string;
    strongs: string;
    definition: string[];
    aiAnalysis: string;
    aiCompareRef?: string;
    aiCompareText?: string;
    occurrenceCount: number;
};

export const EXPORT_CHECK = "OK";

const MOCK_RESPONSE: AIWordAnalysis = {
    original: 'ἀγάπη',
    transliteration: 'agapē',
    pronunciation: 'ah-gah-pay',
    type: 'Sustantivo',
    case: 'Nominativo',
    gender: 'Fem. Singular',
    strongs: "Strong's G26",
    definition: [
        '1. Amor; específicamente amor fraternal, afecto, buena voluntad.',
        '2. Benevolencia; la forma elevada de amor que ve algo infinitamente precioso en su objeto.',
    ],
    aiAnalysis:
        'En 1 Corintios 13, Pablo eleva el agapé por encima de todos los demás dones espirituales. A diferencia de eros (romántico) o phileo (amistad), esta palabra denota un amor voluntario y sacrificial que no se basa en el mérito del amado sino en el carácter del amante.',
    aiCompareRef: 'Juan 3:16',
    aiCompareText: 'donde se usa la misma raíz para el amor de Dios hacia el mundo.',
    occurrenceCount: 116,
};

/**
 * Analiza una palabra o frase seleccionada usando la IA en contexto bíblico.
 */
export async function analyzeWord(
    selectedText: string,
    verseContext: string,
    bookChapterRef: string
): Promise<AIWordAnalysis> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
        console.warn('[aiService] VITE_GEMINI_API_KEY no configurada. Usando datos de ejemplo.');
        return MOCK_RESPONSE;
    }

    const prompt = `Eres un experto en idiomas bíblicos (hebreo y griego) y teología. Analiza la siguiente palabra o frase seleccionada del texto bíblico y responde ÚNICAMENTE en JSON válido, sin markdown ni bloques de código.

Palabra/frase seleccionada: "${selectedText}"
Versículo completo (contexto): "${verseContext}"
Referencia bíblica: ${bookChapterRef}

Responde con este JSON exacto:
{
  "original": "<palabra en hebreo o griego original>",
  "transliteration": "<transliteración latina>",
  "pronunciation": "<pronunciación fonética>",
  "type": "<tipo gramatical en español, ej: Sustantivo, Verbo>",
  "case": "<caso gramatical en español, ej: Nominativo, Acusativo>",
  "gender": "<género y número en español, ej: Masc. Singular>",
  "strongs": "<número Strong's con prefijo H o G, ej: Strong's G3056>",
  "definition": ["<definición 1>", "<definición 2>"],
  "aiAnalysis": "<análisis contextual del uso de esta palabra en el pasaje, 3-4 oraciones>",
  "aiCompareRef": "<referencia bíblica relacionada opcional, ej: Juan 1:1>",
  "aiCompareText": "<texto breve explicando la comparación>",
  "occurrenceCount": <número de veces que aparece en el NT o AT>
}`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
                }),
            }
        );

        if (!response.ok) {
            if (response.status === 429) {
                throw new Error('CUOTA_EXCEDIDA');
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const rawText: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        // Strip possible markdown code fences
        const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned) as AIWordAnalysis;
        return parsed;
    } catch (err: any) {
        console.error('[aiService] Error llamando a Gemini:', err);
        if (err.message === 'CUOTA_EXCEDIDA') throw err;
        return { ...MOCK_RESPONSE, original: selectedText };
    }
}
