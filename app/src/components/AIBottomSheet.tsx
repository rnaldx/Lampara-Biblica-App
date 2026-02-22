import React, { useEffect, useState } from 'react';
import { Share2, Copy, Bookmark, ChevronDown, Check, Info, Save } from 'lucide-react';
import { analyzeWord } from '../services/aiService';

interface AIBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedText: string;
    verseContext: string;
    bookChapterRef: string;
}

interface GrammarTag {
    label: string;
    color: string;
}

const AIBottomSheet: React.FC<AIBottomSheetProps> = ({
    isOpen,
    onClose,
    selectedText,
    verseContext,
    bookChapterRef
}) => {
    const [wordInfo, setWordInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && selectedText) {
            loadAnalysis();
        }
    }, [isOpen, selectedText]);

    const loadAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await analyzeWord(selectedText, verseContext, bookChapterRef);
            setWordInfo(result);
        } catch (err) {
            setError('Error al analizar la palabra. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!wordInfo) return;
        const text = `Análisis de "${selectedText}":\n\n${wordInfo.definition}\n\nAnálisis IA:\n${wordInfo.ai_insight}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSaveToNotes = () => {
        // En una implementación real, esto navegaría a la página de notas con datos prellenados
        console.log('Guardando en notas...', wordInfo);
        // Simular navegación logicamente
        const noteData = {
            text: `Análisis de "${selectedText}" (${bookChapterRef}):\n\n${wordInfo.definition}\n\nPerla de Sabiduría:\n${wordInfo.ai_insight}`,
            book: bookChapterRef.split(' ')[0],
            chapter: parseInt(bookChapterRef.split(' ')[1]),
            tags: ['EstudioIA', wordInfo.transliteration]
        };
        
        // Dispatch custom event for simple communication between components without complex state
        window.dispatchEvent(new CustomEvent('save-ai-note', { detail: noteData }));
        onClose();
        window.location.hash = '/notes';
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={onClose}
            />
            
            {/* Bottom Sheet */}
            <div 
                className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1c2127] rounded-t-[32px] z-[70] shadow-2xl transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                style={{ maxHeight: '85vh' }}
            >
                {/* Drag Handle */}
                <div className="flex justify-center p-3">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>

                <div className="px-6 pb-24 overflow-y-auto max-h-[75vh]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-slate-500 font-medium animate-pulse">Consultando sabiduría original...</p>
                        </div>
                    ) : error ? (
                        <div className="py-10 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Info size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ops, algo salió mal</h3>
                            <p className="text-slate-500 mt-2">{error}</p>
                            <button 
                                onClick={loadAnalysis}
                                className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium"
                            >
                                Reintentar
                            </button>
                        </div>
                    ) : wordInfo ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Word Header */}
                            <div className="mb-6 mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold text-primary dark:text-blue-400 uppercase tracking-wider">Término Original</span>
                                    <span className="text-xs text-slate-400 font-medium">Strong's {wordInfo.strongs_number}</span>
                                </div>
                                <h2 className="text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">{wordInfo.original_word}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-medium text-slate-600 dark:text-slate-300 italic">{wordInfo.transliteration}</span>
                                    <span className="text-sm text-slate-400 font-mono">[{wordInfo.pronunciation}]</span>
                                </div>
                            </div>

                            {/* Grammar Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {wordInfo.morphology.split(' ').map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Definition Card */}
                            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-5 mb-6 border border-blue-100/50 dark:border-blue-800/20">
                                <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <BookOpen size={16} /> Definición
                                </h3>
                                <p className="text-slate-700 dark:text-slate-200 leading-relaxed text-[15px]">
                                    {wordInfo.definition}
                                </p>
                            </div>

                            {/* AI Insights Section */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={18} className="text-amber-500" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Perspectiva Bíblica IA</h3>
                                </div>
                                
                                <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-[15px]">
                                        {wordInfo.ai_insight}
                                    </p>

                                    {/* Cross references */}
                                    <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Versículos Relacionados</p>
                                        <div className="flex flex-wrap gap-2">
                                            {wordInfo.related_verses.map((ref: string, i: number) => (
                                                <button key={i} className="px-3 py-1.5 bg-white dark:bg-slate-900 text-primary dark:text-blue-400 text-xs font-bold rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    {ref}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Sticky Action Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white dark:from-[#1c2127] via-white/95 dark:via-[#1c2127]/95 to-transparent">
                    <div className="flex gap-3 max-w-lg mx-auto">
                        <button 
                            onClick={handleSaveToNotes}
                            disabled={!wordInfo}
                            className="flex-1 bg-primary hover:bg-blue-600 disabled:opacity-50 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                        >
                            <Save size={20} />
                            Guardar en Notas
                        </button>
                        <button 
                            onClick={handleCopy}
                            disabled={!wordInfo}
                            className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
                        >
                            {copied ? <Check className="text-green-500" size={24} /> : <Copy size={24} />}
                        </button>
                        <button 
                            className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-[0.98] transition-all"
                        >
                            <Share2 size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AIBottomSheet;
