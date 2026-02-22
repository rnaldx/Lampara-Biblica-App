import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Link2, Wand2, Bold, Italic, List, Tag, Check, Clock, Calendar } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Note {
    id: string;
    text: string;
    book?: string;
    chapter?: number;
    verse?: number;
    createdAt: string;
    tags?: string[];
}

const SUGGESTED_TAGS = ['Logos', 'Luz', 'Gracia', 'Creación', 'Fe', 'Amor', 'Profecía', 'Oración', 'Sabiduría', 'Salvación'];

const StudyNotes: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editorRef = useRef<HTMLDivElement>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [saved, setSaved] = useState(false);
    const [allNotes, setAllNotes] = useState<Note[]>([]);
    const noteId = useRef<string>(Date.now().toString());

    const locationState = location.state as { text?: string; book?: string; chapter?: number; verse?: number } | null;

    useEffect(() => {
        if (locationState?.text && editorRef.current) {
            const { text, book, chapter, verse } = locationState;
            const now = new Date();
            const dateStr = now.toLocaleDateString('es', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const reference = book ? `${book} ${chapter}${verse ? ':' + verse : ''}` : '';

            editorRef.current.innerHTML = `<div>📅 ${dateStr} · ${timeStr}</div><div>📖 ${reference ? reference : ''}</div><div>Selección: "${text}"</div><div><br></div>`;

            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }

        const savedNotes = JSON.parse(localStorage.getItem('lampara_notes') || '[]');
        setAllNotes(savedNotes);
    }, [locationState]);

    useEffect(() => {
        if (saved) {
            const savedNotes = JSON.parse(localStorage.getItem('lampara_notes') || '[]');
            setAllNotes(savedNotes);
        }
    }, [saved]);

    const handleSave = () => {
        // Use innerHTML instead of innerText to preserve images and formatting
        const content = editorRef.current?.innerHTML || '';
        if (!content || content === '<br>') return;

        const note: Note = {
            id: noteId.current,
            text: content, // Now storing HTML string
            book: locationState?.book,
            chapter: locationState?.chapter,
            verse: locationState?.verse,
            createdAt: new Date().toISOString(),
            tags,
        };
        const existing: Note[] = JSON.parse(localStorage.getItem('lampara_notes') || '[]');
        // Replace if same id, or prepend
        const filtered = existing.filter(n => n.id !== note.id);
        localStorage.setItem('lampara_notes', JSON.stringify([note, ...filtered]));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const addTag = (t: string) => {
        const clean = t.replace(/^#/, '').trim();
        if (!clean || tags.includes(clean)) return;
        setTags(prev => [...prev, clean]);
        setTagInput('');
    };

    const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            removeTag(tags[tags.length - 1]);
        }
    };

    const formatBold = () => document.execCommand('bold');
    const formatItalic = () => document.execCommand('italic');
    const formatList = () => document.execCommand('insertUnorderedList');

    const reference = locationState?.book
        ? `${locationState.book} ${locationState.chapter}${locationState.verse ? ':' + locationState.verse : ''}`
        : null;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-full flex flex-col pb-24">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-[#15202b] border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 pt-[max(env(safe-area-inset-top,0px),12px)]">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center size-10 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-base font-bold tracking-tight text-center flex-1 truncate px-2">
                    {reference ? reference : 'Nueva Nota'}
                </h1>
                <button
                    onClick={handleSave}
                    className={`flex items-center gap-1.5 h-10 px-4 -mr-2 rounded-full font-semibold text-sm transition-all ${saved
                        ? 'bg-green-500/10 text-green-500'
                        : 'text-primary hover:bg-primary/10'
                        }`}
                >
                    {saved ? <><Check size={16} />¡Listo!</> : 'Guardar'}
                </button>
            </header>

            {/* Context Breadcrumb Area */}
            {reference && (
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#1a2231] shrink-0 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#1c2a38] border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 shadow-sm">
                            <Link2 size={14} />
                            {reference}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 text-xs font-medium text-primary">
                            <Wand2 size={14} />
                            Análisis IA
                        </span>
                    </div>
                </div>
            )}

            {/* Tags Row */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/50 flex flex-wrap gap-2 items-center min-h-[44px]">
                {tags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => removeTag(tag)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                    >
                        #{tag} ×
                    </button>
                ))}
                <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="+ Agregar hashtag"
                    className="flex-1 min-w-[120px] bg-transparent text-sm text-slate-600 dark:text-slate-400 placeholder:text-slate-400 dark:placeholder:text-slate-600 outline-none"
                />
            </div>

            {/* Main Editor Area */}
            <main className="flex-1 px-5 py-4">
                <div
                    ref={editorRef}
                    className="w-full min-h-[40vh] text-[1.05rem] leading-relaxed text-slate-800 dark:text-slate-200 outline-none whitespace-pre-wrap"
                    contentEditable={true}
                    suppressContentEditableWarning={true}
                    data-placeholder="Escribe tu nota aquí..."
                    style={{ caretColor: 'var(--color-primary)' }}
                />

                {/* Recent Notes List */}
                {allNotes.length > 0 && (
                    <div className="mt-12 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={18} className="text-primary" />
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Notas Recientes</h2>
                        </div>
                        <div className="space-y-3">
                            {allNotes.slice(0, 5).map(note => {
                                // Extract plain text for preview, removing HTML tags
                                const plainText = note.text.replace(/<[^>]*>/g, '\n').split('\n')
                                    .map(line => line.trim())
                                    .filter(line => line && !line.startsWith('📅') && !line.startsWith('📖') && !line.startsWith('Selección:'))
                                    .join(' ');
                                const preview = plainText.length > 80 ? plainText.slice(0, 80) + '...' : plainText;
                                const date = new Date(note.createdAt);
                                const dateFormatted = date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
                                const timeFormatted = date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

                                return (
                                    <div
                                        key={note.id}
                                        className="p-4 rounded-2xl bg-white dark:bg-[#1c2127] border border-slate-200 dark:border-slate-800 shadow-sm"
                                    >
                                        <div className="flex justify-between items-start gap-3 mb-2">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">
                                                <Calendar size={10} />
                                                {dateFormatted} • {timeFormatted}
                                            </div>
                                            {note.book && (
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {note.book} {note.chapter}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                                            "{preview}"
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </main>

            {/* Formatting Toolbar (Sticky Bottom, above the nav bar) */}
            <div className="sticky bottom-[72px] bg-white dark:bg-[#15202b] border-t border-slate-200 dark:border-slate-800 px-2 py-2 shrink-0 z-10">
                {/* Suggested Tags pill row */}
                <div className="flex gap-2 overflow-x-auto pb-2 px-1 no-scrollbar">
                    {SUGGESTED_TAGS.map(t => (
                        <button
                            key={t}
                            onClick={() => addTag(t)}
                            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${tags.includes(t)
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-primary hover:bg-primary/10'
                                }`}
                        >
                            #{t}
                        </button>
                    ))}
                </div>

                <div className="flex items-center justify-between gap-1">
                    {/* Text Formatting Group */}
                    <div className="flex items-center gap-1 flex-1">
                        <button onClick={formatBold} className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold transition-colors">
                            <Bold size={20} />
                        </button>
                        <button onClick={formatItalic} className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                            <Italic size={20} />
                        </button>
                        <button onClick={formatList} className="size-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                            <List size={20} />
                        </button>
                    </div>

                    {/* Special Actions Group */}
                    <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                        <button onClick={() => { const tag = prompt('Hashtag:'); if (tag) addTag(tag); }} className="h-10 px-4 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-blue-600 transition-colors shadow-lg shadow-primary/20">
                            <Tag size={18} className="mr-1" />
                            <span className="text-sm font-bold">Hashtag</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyNotes;
