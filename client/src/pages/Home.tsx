import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
                    MentiClone
                </h1>
                <p className="text-gray-400 text-lg">Interactive presentations made simple.</p>
            </motion.div>

            <div className="grid gap-6 w-full max-w-md">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-card-bg backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-xl flex flex-col items-center"
                >
                    <h2 className="text-2xl font-bold mb-2">Join Presentation</h2>
                    <p className="text-gray-400 mb-6 text-center text-sm">Enter the room to participate in live polls.</p>
                    <button
                        onClick={() => navigate('/student')}
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 transition-all"
                    >
                        Join Room
                    </button>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-card-bg backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col items-center"
                >
                    <h2 className="text-xl font-bold mb-2">Host Presentation</h2>
                    <p className="text-gray-400 mb-4 text-center text-sm">Control slides and view results.</p>
                    <button
                        onClick={() => navigate('/presenter')}
                        className="w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold transition-all"
                    >
                        Open Dashboard
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
