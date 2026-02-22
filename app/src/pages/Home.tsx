import React, { useState, useEffect, useRef } from 'react';
import { Wand2, PenLine, Highlighter, X, Book, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/layout/TopNav';
import AIBottomSheet from '../components/AIBottomSheet';
import { BIBLE_BOOKS, getChapter, fetchBible } from '../services/bibleService';
import { logChapterRead } from '../services/readingTracker';

const HIGHLIGHT_COLORS = [
    { name: 'Amarillo', bg: 'bg-yellow-200/80 dark:bg-yellow-500/30', style: 'rgba(254,240,138,0.75)' },
    { name: 'Verde', bg: 'bg-green-200/80 dark:bg-green-500/30', style: 'rgba(187,247,208,0.75)' },
    { name: 'Azul', bg: 'bg-sky-200/80 dark:bg-sky-500/30', style: 'rgba(186,230,253,0.75)' },
    { name: 'Rosa', bg: 'bg-pink-200/80 dark:bg-pink-500/30', style: 'rgba(251,207,232,0.75)' },
    { name: 'Naranja', bg: 'bg-orange-200/80 dark:bg-orange-500/30', style: 'rgba(254,215,170,0.75)' },
];

const PopoverMenu = ({ onAIInsight, onClose, onNote, onHighlight, selectedColor, onColorSelect }: any) => {
    return (
        <div className="flex flex-col items-center gap-1.5">
            {/* Color Row */}
            <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c2127] rounded-xl shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-2">
                {HIGHLIGHT_COLORS.map((c, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onColorSelect(i); onHighlight(i); onClose?.(); }}
                        className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95"
                        style={{
                            backgroundColor: c.style,
                            borderColor: selectedColor === i ? '#3b82f6' : 'transparent',
                        }}
                        title={c.name}
                    />
                ))}
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                <Highlighter size={16} className="text-slate-500" />
            </div>

            {/* Actions Row */}
            <div className="bg-white dark:bg-[#1c2127] rounded-xl shadow-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-1 flex items-center gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onAIInsight?.(); onClose?.(); }}
                    className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                >
                    <Wand2 className="text-primary group-hover:scale-110 transition-transform" size={20} />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">Análisis IA</span>
                </button>
                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                <button
                    onClick={(e) => { e.stopPropagation(); onNote?.(); onClose?.(); }}
                    className="flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition group"
                >
                    <PenLine className="text-slate-500 dark:text-slate-300 group-hover:text-primary transition-colors" size={20} />
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">Nota</span>
                </button>
            </div>
            <div className="w-3 h-3 bg-white dark:bg-[#1c2127] rotate-45 shadow-sm"></div>
        </div>
    );
};

const BookSelector = ({ isOpen, onClose, onSelectBook }: { isOpen: boolean; onClose: () => void; onSelectBook: (idx: number) => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1c2127] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Seleccionar Libro</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto p-2 flex-1">
                    {BIBLE_BOOKS.map((book, idx) => (
                        <button key={idx} onClick={() => onSelectBook(idx)}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3">
                            <Book size={18} className="text-primary" />
                            <span className="font-medium text-slate-800 dark:text-slate-200">{book}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ChapterSelector = ({ isOpen, onClose, bookIndex, onSelectChapter }: any) => {
    const [numChapters, setNumChapters] = useState(0);
    useEffect(() => {
        if (!isOpen) return;
        fetchBible().then(bible => { if (bible?.[bookIndex]) setNumChapters(bible[bookIndex].chapters.length); });
    }, [isOpen, bookIndex]);
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#1c2127] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{BIBLE_BOOKS[bookIndex]} — Capítulos</h3>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto p-4 grid grid-cols-5 gap-2">
                    {Array.from({ length: numChapters }).map((_, idx) => (
                        <button key={idx} onClick={() => onSelectChapter(idx)}
                            className="aspect-square flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 hover:bg-primary hover:text-white font-medium text-slate-800 dark:text-slate-200 transition-colors">
                            {idx + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SideMenu = ({ isOpen, onClose, bookIndex, onSelectBook }: any) => {
    if (!isOpen) return null;
    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <aside className="fixed left-0 top-0 h-full w-72 z-50 bg-white dark:bg-[#131c25] shadow-2xl flex flex-col pt-12 pb-6 overflow-hidden border-r border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between px-5 mb-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Libros</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto flex-1 px-3">
                    {BIBLE_BOOKS.map((book, idx) => (
                        <button key={idx} onClick={() => { onSelectBook(idx); }}
                            className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center gap-3 mb-0.5 transition-colors ${bookIndex === idx ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                            <Book size={16} className={bookIndex === idx ? 'text-primary' : 'text-slate-400'} />
                            {book}
                        </button>
                    ))}
                </div>
            </aside>
        </>
    );
};

const Home: React.FC = () => {
    const navigate = useNavigate();

    const [isAISheetOpen, setIsAISheetOpen] = useState(false);
    const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false);
    const [isChapterSelectorOpen, setIsChapterSelectorOpen] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

    const [bookIndex, setBookIndex] = useState(0);
    const [chapterIndex, setChapterIndex] = useState(0);
    const [verses, setVerses] = useState<{ n: number; text: string }[]>([]);
    const [selectedColor, setSelectedColor] = useState(0);

    // Map: verse number → list of { text, colorIdx }
    const [highlights, setHighlights] = useState<{ [n: number]: { text: string; colorIdx: number }[] }>({});
    const [selectionCoord, setSelectionCoord] = useState<{ top: number; left: number; text: string; verseN: number | null } | null>(null);
    const [aiContext, setAiContext] = useState<{ text: string; context: string; ref: string } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getChapter(bookIndex, chapterIndex).then(setVerses);
        logChapterRead(bookIndex, chapterIndex);
    }, [bookIndex, chapterIndex]);

    useEffect(() => {
        const handleSelChange = () => {
            const sel = window.getSelection();
            if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setSelectionCoord(null); return; }
            if (!containerRef.current?.contains(sel.anchorNode)) { setSelectionCoord(null); return; }
            const text = sel.toString().trim();
            if (text.length > 0) {
                const rect = sel.getRangeAt(0).getBoundingClientRect();
                // Detect which verse the selection is in via data-verse attribute
                let node: Node | null = sel.anchorNode;
                let verseN: number | null = null;
                while (node && node !== containerRef.current) {
                    if ((node as Element).getAttribute) {
                        const dv = (node as Element).getAttribute('data-verse');
                        if (dv) { verseN = parseInt(dv, 10); break; }
                    }
                    node = node.parentNode;
                }
                setSelectionCoord({ top: rect.top, left: rect.left + rect.width / 2, text, verseN });
            } else {
                setSelectionCoord(null);
            }
        };
        document.addEventListener('selectionchange', handleSelChange);
        return () => document.removeEventListener('selectionchange', handleSelChange);
    }, []);

    const handleHighlight = (colorIdx?: number) => {
        if (!selectionCoord) return;
        const { text, verseN } = selectionCoord;
        // Use the directly-passed colorIdx if available (avoids async state read bug)
        const colorToUse = colorIdx !== undefined ? colorIdx : selectedColor;
        if (verseN !== null) {
            setHighlights(prev => ({
                ...prev,
                [verseN]: [...(prev[verseN] || []), { text, colorIdx: colorToUse }]
            }));
        } else {
            const match = verses.find(v => v.text.includes(text));
            if (match) {
                setHighlights(prev => ({
                    ...prev,
                    [match.n]: [...(prev[match.n] || []), { text, colorIdx: colorToUse }]
                }));
            }
        }
        window.getSelection()?.removeAllRanges();
        setSelectionCoord(null);
    };

    const renderVerse = (n: number, text: string) => {
        const hl = highlights[n];
        if (!hl || hl.length === 0) return text;
        let parts: any[] = [text];
        hl.forEach(({ text: hText, colorIdx }) => {
            parts = parts.flatMap(el => {
                if (typeof el !== 'string') return el;
                const split = el.split(hText);
                const result: any[] = [];
                split.forEach((part, i) => {
                    result.push(part);
                    if (i < split.length - 1) {
                        result.push(
                            <mark key={`h-${i}-${hText}`}
                                style={{ backgroundColor: HIGHLIGHT_COLORS[colorIdx].style, borderRadius: '3px', padding: '0 2px' }}>
                                {hText}
                            </mark>
                        );
                    }
                });
                return result;
            });
        });
        return <>{parts}</>;
    };

    return (
        <div className="h-full relative flex flex-col" ref={containerRef}>
            <TopNav
                title={`${BIBLE_BOOKS[bookIndex]} ${chapterIndex + 1}`}
                onTitleClick={() => setIsBookSelectorOpen(true)}
                onMenuClick={() => setIsSideMenuOpen(true)}
            />

            <main className="flex-1 overflow-y-auto pt-28 pb-4 px-5 no-scrollbar">
                <div className="max-w-xl mx-auto">
                    <h1 className="text-3xl font-serif font-bold text-center mb-8 mt-4 text-slate-900 dark:text-white">
                        {BIBLE_BOOKS[bookIndex]} {chapterIndex + 1}
                    </h1>

                    <div className="font-serif text-[1.12rem] leading-[1.9] text-slate-700 dark:text-slate-300 space-y-2">
                        {verses.map(verse => (
                            <p key={verse.n} data-verse={verse.n} className="relative hover:bg-slate-50/70 dark:hover:bg-slate-800/20 transition-colors p-1 -mx-1 rounded-lg">
                                <sup className="text-[11px] font-sans mr-1.5 select-none font-semibold text-slate-400 dark:text-slate-500">{verse.n}</sup>
                                <span>{renderVerse(verse.n, verse.text)}</span>
                            </p>
                        ))}
                    </div>

                    {/* Chapter Navigation Footer */}
                    <div className="flex justify-between items-center mt-10 py-5 border-t border-slate-200 dark:border-slate-800">
                        <button
                            disabled={chapterIndex === 0 && bookIndex === 0}
                            onClick={() => { if (chapterIndex > 0) setChapterIndex(p => p - 1); else { setBookIndex(p => Math.max(0, p - 1)); setChapterIndex(0); } }}
                            className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={18} />Anterior
                        </button>
                        <button
                            onClick={() => setIsChapterSelectorOpen(true)}
                            className="px-4 py-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition"
                        >
                            Cap. {chapterIndex + 1}
                        </button>
                        <button
                            onClick={() => setChapterIndex(p => p + 1)}
                            className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition"
                        >
                            Siguiente<ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </main>

            {/* Floating Popover Menu on text selection */}
            {selectionCoord && (
                <div
                    className="fixed z-50 pointer-events-auto"
                    style={{
                        top: Math.max(10, selectionCoord.top - 140) + 'px',
                        left: selectionCoord.left + 'px',
                        transform: 'translateX(-50%)',
                    }}
                    onMouseDown={e => e.stopPropagation()}
                >
                    <PopoverMenu
                        onAIInsight={() => {
                            if (selectionCoord) {
                                const verse = verses.find(v => v.n === selectionCoord.verseN);
                                setAiContext({
                                    text: selectionCoord.text,
                                    context: verse?.text || '',
                                    ref: `${BIBLE_BOOKS[bookIndex]} ${chapterIndex + 1}${verse ? ':' + verse.n : ''}`
                                });
                            }
                            setIsAISheetOpen(true);
                            setSelectionCoord(null);
                        }}
                        onNote={() => {
                            const firstVerse = verses.find(v => v.text.includes(selectionCoord.text));
                            navigate('/notes', {
                                state: { text: selectionCoord.text, book: BIBLE_BOOKS[bookIndex], chapter: chapterIndex + 1, verse: firstVerse?.n }
                            });
                            setSelectionCoord(null);
                        }}
                        onHighlight={handleHighlight}
                        selectedColor={selectedColor}
                        onColorSelect={setSelectedColor}
                        onClose={() => setSelectionCoord(null)}
                    />
                </div>
            )}

            <SideMenu
                isOpen={isSideMenuOpen}
                onClose={() => setIsSideMenuOpen(false)}
                bookIndex={bookIndex}
                chapterIndex={chapterIndex}
                onSelectBook={(idx: number) => { setBookIndex(idx); setChapterIndex(0); setIsSideMenuOpen(false); }}
                onSelectChapter={(idx: number) => { setChapterIndex(idx); setIsSideMenuOpen(false); }}
            />

            <BookSelector
                isOpen={isBookSelectorOpen}
                onClose={() => setIsBookSelectorOpen(false)}
                onSelectBook={(idx: number) => { setBookIndex(idx); setIsBookSelectorOpen(false); setIsChapterSelectorOpen(true); }}
            />
            <ChapterSelector
                isOpen={isChapterSelectorOpen}
                onClose={() => setIsChapterSelectorOpen(false)}
                bookIndex={bookIndex}
                onSelectChapter={(idx: number) => { setChapterIndex(idx); setIsChapterSelectorOpen(false); }}
            />
            <AIBottomSheet
                isOpen={isAISheetOpen}
                onClose={() => setIsAISheetOpen(false)}
                selectedText={aiContext?.text}
                verseContext={aiContext?.context}
                bookChapterRef={aiContext?.ref}
            />
        </div>
    );
};

export default Home;
