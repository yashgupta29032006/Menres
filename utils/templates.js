const templates = [
    {
        id: 'check-in',
        name: 'Weekly Check-in',
        description: 'Start your meeting with a quick pulse check.',
        slides: [
            {
                id: 't1-s1',
                type: 'poll',
                question: 'How are you feeling today?',
                options: { 'Energized 🚀': 0, 'Good 🙂': 0, 'Needs Coffee ☕': 0, 'Stressed 😫': 0 }
            },
            {
                id: 't1-s2',
                type: 'wordcloud',
                question: 'In one word, what is your main focus this week?',
                options: {}
            }
        ]
    },
    {
        id: 'agile-retro',
        name: 'Agile Retrospective',
        description: 'Classic Stop-Start-Continue format.',
        slides: [
            {
                id: 't2-s1',
                type: 'wordcloud',
                question: 'What went well this sprint?',
                options: {}
            },
            {
                id: 't2-s2',
                type: 'wordcloud',
                question: 'What should we improve?',
                options: {}
            },
            {
                id: 't2-s3',
                type: 'poll',
                question: 'How would you rate this sprint?',
                options: { '5 - Excellent': 0, '4 - Good': 0, '3 - Average': 0, '2 - Poor': 0, '1 - Terrible': 0 }
            }
        ]
    },
    {
        id: 'quiz',
        name: 'Fun Pop Quiz',
        description: 'Lighten the mood with some trivia.',
        slides: [
            {
                id: 't3-s1',
                type: 'poll',
                question: 'Which is NOT a JavaScript framework?',
                options: { 'React': 0, 'Vue': 0, 'Django': 0, 'Svelte': 0 }
            },
            {
                id: 't3-s2',
                type: 'poll',
                question: 'What is the answer to life, the universe, and everything?',
                options: { '42': 0, '24': 0, 'Infinity': 0, 'NaN': 0 }
            }
        ]
    }
];

module.exports = templates;
