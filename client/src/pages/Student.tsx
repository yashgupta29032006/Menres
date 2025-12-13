import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { InitialState, type AppState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaLock } from 'react-icons/fa';

const Student = () => {
    const [state, setState] = useState<AppState>(InitialState);
    const [connected, setConnected] = useState(socket.connected);
    const [inputVal, setInputVal] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        socket.on('state_update', (s) => {
            setState(prev => {
                if (prev.currentSlide.id !== s.currentSlide.id) {
                    setSubmitted(false);
                    setInputVal('');
                }
                return s;
            });
        });
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('success_message', () => setSubmitted(true));

        return () => {
            socket.off('state_update');
            socket.off('connect');
            socket.off('disconnect');
            socket.off('success_message');
        };
    }, []);

    const handleSubmit = () => {
        if (inputVal) socket.emit('submit_response', { type: state.currentSlide.type, content: inputVal });
    };

    if (!state.isActive) return (
        <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mb-4 text-2xl animate-pulse text-gray-500">
                <FaLock />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Session Paused</h1>
            <p className="text-gray-500 text-sm">Please wait for the host to resume.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-light flex flex-col font-sans">
            {/* Mobile Header */}
            <header className="px-6 py-4 flex justify-between items-center bg-white border-b border-gray-100 sticky top-0 z-20">
                <span className="font-bold text-gray-800 tracking-tight">MenRes</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400">Live</span>
                    <div className={`w-2 h-2 rounded-full ${connected ? 'bg-brand-accent animate-pulse' : 'bg-brand-danger'}`} />
                </div>
            </header>

            <main className="flex-1 p-6 flex flex-col max-w-md mx-auto w-full">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={state.currentSlide.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col"
                    >
                        <div className="mb-8 mt-2">
                            <span className="inline-block px-3 py-1 bg-brand-primary/10 text-brand-primary text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                                Question
                            </span>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                                {state.currentSlide.question}
                            </h2>
                        </div>

                        <div className="flex-1">
                            {submitted && state.currentSlide.type !== 'poll' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="w-20 h-20 bg-green-50 text-brand-accent rounded-full flex items-center justify-center mb-6 text-4xl">
                                        <FaCheckCircle />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Answer Locked</h3>
                                    <p className="text-gray-500 text-sm">Your response has been recorded.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {state.currentSlide.type === 'poll' && (
                                        <div className="grid gap-3">
                                            {Object.keys(state.currentSlide.options).map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => {
                                                        setInputVal(opt);
                                                        socket.emit('submit_response', { type: state.currentSlide.type, content: opt });
                                                    }}
                                                    className="w-full text-left p-5 rounded-2xl bg-white border-2 border-gray-100 shadow-sm hover:border-brand-primary hover:shadow-md transition-all font-semibold text-gray-700 active:scale-[0.98] active:bg-brand-primary/5 group"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span>{opt}</span>
                                                        <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-brand-primary" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {(state.currentSlide.type === 'text' || state.currentSlide.type === 'wordcloud') && (
                                        <>
                                            <textarea
                                                className="w-full p-5 text-lg bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 transition-all resize-none shadow-sm placeholder:text-gray-300"
                                                placeholder="Type your answer here..."
                                                rows={4}
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSubmit}
                                                disabled={!inputVal}
                                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-[0.98] ${inputVal
                                                        ? 'bg-brand-primary hover:bg-brand-secondary shadow-brand-primary/30'
                                                        : 'bg-gray-300 shadow-none cursor-not-allowed'
                                                    }`}
                                            >
                                                Submit Answer
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Student;
