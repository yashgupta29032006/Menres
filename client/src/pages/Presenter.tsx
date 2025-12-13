import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { InitialState, type AppState, type SlideType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaPlay, FaPause, FaList } from 'react-icons/fa';
// Need to install this or use an image API by Google for quickness? I'll use a simple library if installed... waits, I didn't install qrcode. I'll use an img src for now using a public API to save install time or just simple text. Oh wait, previous used `qrcode.min.js`. I can't easily use that in React without a lib. I'll install `qrcode` quickly or use a public API.
// Actually, `npm install qrcode` is fast. I'll add it to the install task or just run it? 
// I'll use a public API for the QR code for now: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${url}`. simpler.

const Presenter = () => {
    const [state, setState] = useState<AppState>(InitialState);
    const [connected, setConnected] = useState(socket.connected);
    const [joinUrl, setJoinUrl] = useState('');
    const [newSlideQ, setNewSlideQ] = useState('');
    const [newSlideType, setNewSlideType] = useState<SlideType>('text');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [blockWord, setBlockWord] = useState('');

    // Templates Modal
    const [showTemplates, setShowTemplates] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        setJoinUrl(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/student`);
        // In dev, port might differ. If dev (5173), points to student on 5173. 
        // In prod (3000), points to 3000. Correct.

        socket.on('state_update', setState);
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));

        return () => {
            socket.off('state_update', setState);
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    // --- ACTIONS ---
    const addSlide = () => {
        if (!newSlideQ) return;
        const options: Record<string, number> = {};
        if (newSlideType === 'poll') {
            pollOptions.filter(o => o.trim()).forEach(o => options[o] = 0);
            if (Object.keys(options).length < 1) return alert('Add at least one option');
        }

        socket.emit('admin_control', {
            action: 'add_slide',
            value: { type: newSlideType, question: newSlideQ, options }
        });
        setNewSlideQ('');
        setPollOptions(['', '']);
    };

    const deleteSlide = (index: number) => {
        if (confirm('Delete slide?')) {
            socket.emit('admin_control', { action: 'delete_slide', value: index });
        }
    };

    const moveSlide = (index: number, move: number) => {
        socket.emit('admin_control', { action: 'reorder_slides', value: { fromIndex: index, toIndex: index + move } });
    };

    const setSlide = (index: number) => {
        socket.emit('admin_control', { action: 'set_slide', value: index });
    };

    const toggleActive = () => {
        socket.emit('admin_control', { action: 'toggle_active', value: !state.isActive });
    };

    const clearResponses = () => {
        if (confirm('Clear responses?')) {
            socket.emit('admin_control', { action: 'clear_responses' });
        }
    };

    const addBlock = () => {
        if (blockWord) {
            socket.emit('admin_update_blocklist', { action: 'add', word: blockWord });
            setBlockWord('');
        }
    };

    const removeBlock = (word: string) => {
        socket.emit('admin_update_blocklist', { action: 'remove', word });
    };

    const fetchTemplates = () => {
        socket.emit('get_templates', (t: any[]) => {
            setTemplates(t);
            setShowTemplates(true);
        });
    };

    const applyTemplate = (id: string) => {
        if (confirm('Apply template? This will replace slides.')) {
            socket.emit('use_template', id);
            setShowTemplates(false);
        }
    };

    return (
        <div className="h-screen bg-dark-bg text-white flex overflow-hidden font-sans">
            {/* LEFT SIDEBAR - SLIDES */}
            <div className="w-64 bg-card-bg backdrop-blur-md border-r border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 font-bold flex justify-between items-center">
                    <span>Slides ({state.slides.length})</span>
                    <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {state.slides.map((s, i) => (
                        <div
                            key={s.id + i}
                            onClick={() => setSlide(i)}
                            className={`p-3 rounded-lg cursor-pointer border transition-all relative group ${i === state.currentSlideIndex
                                ? 'bg-accent/20 border-accent'
                                : 'bg-white/5 border-transparent hover:bg-white/10'
                                }`}
                        >
                            <div className="text-xs text-gray-400 mb-1 font-mono flex justify-between">
                                <span>#{i + 1}</span>
                                <span className="uppercase">{s.type}</span>
                            </div>
                            <div className="text-sm font-medium truncate mb-6">{s.question}</div>

                            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-md p-1">
                                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, -1); }} className="p-1 hover:text-accent"><FaArrowUp size={10} /></button>
                                <button onClick={(e) => { e.stopPropagation(); moveSlide(i, 1); }} className="p-1 hover:text-accent"><FaArrowDown size={10} /></button>
                                <button onClick={(e) => { e.stopPropagation(); deleteSlide(i); }} className="p-1 hover:text-red-400"><FaTrash size={10} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT - PREVIEW */}
            <div className="flex-1 flex flex-col bg-gradient-to-br from-dark-bg to-[#1e1e2e] relative overflow-hidden">
                {/* Background FX */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="p-6 flex justify-between items-center z-10">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 max-w-3xl truncate">
                        {state.currentSlide.question}
                    </h2>
                    <div className="flex gap-3">
                        <button onClick={toggleActive} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${state.isActive ? 'bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30' : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'}`}>
                            {state.isActive ? <><FaPause /> Pause</> : <><FaPlay /> Resume</>}
                        </button>
                        <button onClick={clearResponses} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg font-semibold transition-all">Clear</button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 z-10 overflow-y-auto">
                    <RenderResults state={state} />
                </div>
            </div>

            {/* RIGHT SIDEBAR - CONTROLS */}
            <div className="w-80 bg-card-bg backdrop-blur-md border-l border-white/10 flex flex-col overflow-y-auto">
                <div className="p-6 space-y-6">
                    {/* Join Info */}
                    <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col items-center">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(joinUrl)}`} alt="QR Code" className="w-32 h-32 mb-2" />
                        <div className="text-black text-xs font-mono break-all text-center bg-gray-100 p-2 rounded w-full">
                            {joinUrl}
                        </div>
                    </div>

                    {/* Add Slide */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider flex items-center gap-2"><FaPlus /> Add Slide</h3>
                        <input
                            value={newSlideQ}
                            onChange={e => setNewSlideQ(e.target.value)}
                            placeholder="Question?"
                            className="w-full bg-black/20 border border-white/20 rounded-lg p-2 text-sm focus:border-accent outline-none"
                        />

                        <div className="grid grid-cols-3 gap-2">
                            {['text', 'poll', 'wordcloud'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setNewSlideType(t as SlideType)}
                                    className={`p-2 rounded text-xs capitalize border ${newSlideType === t ? 'bg-accent border-accent' : 'bg-white/5 border-white/10'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {newSlideType === 'poll' && (
                            <div className="space-y-2 pl-2 border-l-2 border-white/10">
                                {pollOptions.map((opt, idx) => (
                                    <input
                                        key={idx}
                                        value={opt}
                                        onChange={e => {
                                            const newOpts = [...pollOptions];
                                            newOpts[idx] = e.target.value;
                                            setPollOptions(newOpts);
                                        }}
                                        placeholder={`Option ${idx + 1}`}
                                        className="w-full bg-black/20 border border-white/10 rounded p-1.5 text-xs outline-none"
                                    />
                                ))}
                                <button onClick={() => setPollOptions([...pollOptions, ''])} className="text-xs text-accent hover:underline">+ Add Option</button>
                            </div>
                        )}

                        <button onClick={addSlide} className="w-full bg-accent hover:bg-accent-hover text-white py-2 rounded-lg text-sm font-semibold transition-colors">Create Slide</button>
                    </div>

                    <div className="h-px bg-white/10" />

                    {/* Tools */}
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-400 text-sm uppercase tracking-wider">Tools</h3>
                        <button onClick={fetchTemplates} className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm flex items-center justify-center gap-2 border border-white/10"><FaList /> Templates</button>

                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <input
                                    value={blockWord}
                                    onChange={e => setBlockWord(e.target.value)}
                                    placeholder="Block word..."
                                    className="flex-1 bg-black/20 border border-white/20 rounded p-1.5 text-xs outline-none"
                                />
                                <button onClick={addBlock} className="bg-red-500/20 text-red-300 px-3 rounded text-xs hover:bg-red-500/30">Block</button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {state.customBlocklist.map(w => (
                                    <span key={w} className="bg-red-900/50 text-red-200 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                                        {w} <button onClick={() => removeBlock(w)} className="hover:text-white">&times;</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TEMPLATES MODAL */}
            {showTemplates && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card-bg border border-white/20 p-6 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Templates</h2>
                            <button onClick={() => setShowTemplates(false)} className="text-2xl hover:text-accent">&times;</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-1">
                            {templates.map(t => (
                                <div key={t.id} onClick={() => applyTemplate(t.id)} className="bg-white/5 hover:bg-white/10 p-4 rounded-xl border border-white/5 hover:border-accent cursor-pointer transition-all">
                                    <h4 className="text-lg font-bold text-accent mb-2">{t.name}</h4>
                                    <p className="text-sm text-gray-400 mb-2">{t.description}</p>
                                    <span className="text-xs bg-black/30 px-2 py-1 rounded inline-block">{t.slides.length} slides</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// --- SUB COMPONENTS FOR RESULTS ---

const RenderResults = ({ state }: { state: AppState }) => {
    const { currentSlide, responses, pollCounts } = state;

    if (currentSlide.type === 'text') {
        return (
            <div className="w-full max-w-3xl space-y-3">
                <AnimatePresence>
                    {responses.map((r) => (
                        <motion.div
                            key={r.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card-bg border border-white/10 p-4 rounded-xl shadow-lg border-l-4 border-l-accent"
                        >
                            <div className="text-lg">{r.content}</div>
                        </motion.div>
                    ))}
                    {responses.length === 0 && <div className="text-gray-500 text-center italic">Waiting for responses...</div>}
                </AnimatePresence>
            </div>
        );
    }

    if (currentSlide.type === 'poll') {
        const total = Object.values(pollCounts).reduce((a, b) => a + b, 0);
        return (
            <div className="w-full max-w-3xl space-y-6">
                {Object.entries(currentSlide.options).map(([opt, _]) => {
                    const count = pollCounts[opt] || 0;
                    const percent = total > 0 ? (count / total) * 100 : 0;
                    return (
                        <div key={opt} className="relative">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="font-bold">{opt}</span>
                                <span className="text-gray-400">{count} ({Math.round(percent)}%)</span>
                            </div>
                            <div className="h-6 bg-black/30 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-accent to-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    if (currentSlide.type === 'wordcloud') {
        // Simple Word Cloud Implementation
        const wordCounts: Record<string, number> = {};
        responses.forEach(r => wordCounts[r.content] = (wordCounts[r.content] || 0) + 1);
        const words = Object.entries(wordCounts);

        return (
            <div className="flex flex-wrap justify-center gap-4 max-w-4xl">
                {words.map(([word, count]) => {
                    const size = 1 + (count * 0.5);
                    return (
                        <motion.span
                            key={word}
                            layout
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{ fontSize: `${Math.min(size, 5)}rem` }}
                            className="text-accent font-bold inline-block"
                        >
                            {word}
                        </motion.span>
                    )
                })}
                {words.length === 0 && <div className="text-gray-500 italic">Waiting...</div>}
            </div>
        )
    }

    return null;
};

export default Presenter;
