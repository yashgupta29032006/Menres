import { useEffect, useState } from 'react';
import { socket } from '../socket';
import { InitialState, type AppState } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Student = () => {
    const [state, setState] = useState<AppState>(InitialState);
    const [connected, setConnected] = useState(socket.connected);
    const [inputVal, setInputVal] = useState('');
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        socket.on('state_update', (s) => {
            setState(prev => {
                // Reset local state on new question
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
        <div className="min-h-screen bg-menti-bg flex flex-col items-center justify-center p-4 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-2xl animate-pulse">⏸</div>
            <h1 className="text-xl font-bold text-menti-dark-text mb-2">Presentation Paused</h1>
            <p className="text-gray-500">The presenter will resume shortly.</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-menti-bg flex flex-col items-center p-4 font-sans">
            <header className="w-full max-w-md flex justify-between items-center py-4 mb-8">
                <span className="font-bold text-gray-400">MentiClone</span>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            </header>

            <main className="w-full max-w-md">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={state.currentSlide.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white p-6 md:p-8 rounded-xl shadow-menti-card border border-gray-100"
                    >
                        <h2 className="text-2xl font-bold text-menti-dark-text mb-6 leading-tight">{state.currentSlide.question}</h2>

                        {submitted && state.currentSlide.type !== 'poll' ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                                <p className="font-semibold text-gray-800">Sent!</p>
                                <p className="text-sm text-gray-500 mt-2">Wait for the presenter to show the next slide.</p>
                                <button onClick={() => setSubmitted(false)} className="mt-8 text-menti-blue text-sm font-semibold hover:underline">Submit another answer</button>
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
                                                className="w-full text-left p-4 rounded-lg bg-gray-50 border border-gray-200 hover:border-menti-blue hover:shadow-menti-hover hover:bg-white transition-all font-medium text-gray-700 active:scale-[0.98]"
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {(state.currentSlide.type === 'text' || state.currentSlide.type === 'wordcloud') && (
                                    <>
                                        <input
                                            className="w-full p-4 text-lg bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-menti-blue focus:ring-1 focus:ring-menti-blue transition-all"
                                            placeholder="Enter your answer..."
                                            value={inputVal}
                                            onChange={(e) => setInputVal(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            onClick={handleSubmit}
                                            disabled={!inputVal}
                                            className={`w-full py-3 rounded-md font-bold text-white transition-all shadow-sm ${inputVal ? 'bg-menti-blue hover:bg-menti-blue-dark active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed'}`}
                                        >
                                            Submit
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Student;
