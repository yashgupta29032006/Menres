const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const profanityFilter = require('./utils/filter');
const templates = require('./utils/templates');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// State Management
const state = {
    slides: [
        {
            id: 'default-slide',
            type: 'text',
            question: 'Welcome! How are you feeling today?',
            options: {} // For polls
        }
    ],
    currentSlideIndex: 0,
    responses: [], // Array of { id, slideId, type, content, timestamp, socketId }
    isActive: true
};

// Helper to get public state
const getPublicState = () => {
    const currentSlide = state.slides[state.currentSlideIndex];

    // Filter responses for the current slide
    const currentResponses = state.responses.filter(r => r.slideId === currentSlide.id);

    // Calculate poll counts if applicable
    let pollCounts = {};
    if (currentSlide.type === 'poll') {
        // Initialize counts
        Object.keys(currentSlide.options).forEach(opt => pollCounts[opt] = 0);
        // Count votes
        currentResponses.forEach(r => {
            if (pollCounts[r.content] !== undefined) {
                pollCounts[r.content]++;
            }
        });
    }

    return {
        slides: state.slides,
        currentSlideIndex: state.currentSlideIndex,
        currentSlide: currentSlide,
        responses: currentResponses,
        pollCounts: pollCounts,
        isActive: state.isActive,
        customBlocklist: profanityFilter.getCustomBlocklist()
    };
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send initial state
    socket.emit('state_update', getPublicState());

    // --- Student Events ---

    socket.on('submit_response', (data) => {
        if (!state.isActive) {
            return socket.emit('error_message', 'Session is currently paused.');
        }

        const { type, content } = data;
        const currentSlide = state.slides[state.currentSlideIndex];

        // 1. Check Profanity
        if (type === 'text' || type === 'wordcloud') {
            if (profanityFilter.isProfane(content)) {
                return socket.emit('error_message', 'Your response contains restricted words. Please revise.');
            }
        }

        // 2. Process Response
        const response = {
            id: Date.now().toString(),
            slideId: currentSlide.id,
            type,
            content,
            timestamp: Date.now(),
            socketId: socket.id
        };

        state.responses.push(response);

        // 3. Broadcast Update
        io.emit('state_update', getPublicState());
        socket.emit('success_message', 'Response submitted successfully!');
    });

    // --- Presenter/Admin Events ---

    socket.on('admin_update_blocklist', (data) => {
        const { action, word } = data; // action: 'add' or 'remove'

        if (action === 'add') {
            profanityFilter.addWords([word]);

            // Retroactive Enforcement: Filter existing responses
            const originalCount = state.responses.length;
            state.responses = state.responses.filter(r => !profanityFilter.isProfane(r.content));

            if (state.responses.length < originalCount) {
                console.log(`Removed ${originalCount - state.responses.length} responses due to new blocklist rule.`);
            }

        } else if (action === 'remove') {
            profanityFilter.removeWords([word]);
        }

        io.emit('state_update', getPublicState());
    });

    socket.on('admin_control', (data) => {
        const { action, value } = data;

        if (action === 'toggle_active') {
            state.isActive = value;
        } else if (action === 'clear_responses') {
            // Clear responses ONLY for current slide
            const currentSlideId = state.slides[state.currentSlideIndex].id;
            state.responses = state.responses.filter(r => r.slideId !== currentSlideId);
        } else if (action === 'add_slide') {
            const newSlide = {
                id: Date.now().toString(),
                type: value.type,
                question: value.question,
                options: value.options || {}
            };
            state.slides.push(newSlide);
            // Optional: Jump to new slide?
            // state.currentSlideIndex = state.slides.length - 1;
        } else if (action === 'set_slide') {
            if (value >= 0 && value < state.slides.length) {
                state.currentSlideIndex = value;
            }
        } else if (action === 'reorder_slides') {
            const { fromIndex, toIndex } = value;
            if (fromIndex >= 0 && fromIndex < state.slides.length && toIndex >= 0 && toIndex < state.slides.length) {
                const [movedSlide] = state.slides.splice(fromIndex, 1);
                state.slides.splice(toIndex, 0, movedSlide);
                // Adjust currentSlideIndex if needed
                if (state.currentSlideIndex === fromIndex) {
                    state.currentSlideIndex = toIndex;
                } else if (state.currentSlideIndex === toIndex && fromIndex < toIndex) {
                    state.currentSlideIndex--;
                } else if (state.currentSlideIndex === toIndex && fromIndex > toIndex) {
                    state.currentSlideIndex++;
                }
            }
        } else if (action === 'delete_slide') {
            if (state.slides.length > 1) {
                state.slides.splice(value, 1);
                if (state.currentSlideIndex >= state.slides.length) {
                    state.currentSlideIndex = state.slides.length - 1;
                }
            }
        }

        io.emit('state_update', getPublicState());
    });

    socket.on('get_templates', (callback) => {
        // Return templates without the full slide data if we want to save bandwidth, 
        // but for now sending everything is fine.
        callback(templates);
    });

    socket.on('use_template', (templateId) => {
        const template = templates.find(t => t.id === templateId);
        if (template) {
            // Deep copy slides to avoid mutating the original template if we modify slides later
            state.slides = JSON.parse(JSON.stringify(template.slides));
            state.currentSlideIndex = 0;
            state.responses = []; // Clear all responses
            state.isActive = true;

            io.emit('state_update', getPublicState());
            socket.emit('success_message', `Template '${template.name}' applied successfully!`);
        } else {
            socket.emit('error_message', 'Template not found.');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
