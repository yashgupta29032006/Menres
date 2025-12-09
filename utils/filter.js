const Filter = require('bad-words');

class ProfanityFilter {
    constructor() {
        this.filter = new Filter();
        this.customBlocklist = new Set();
    }

    /**
     * Add words to the custom blocklist
     * @param {string[]} words - Array of words to block
     */
    addWords(words) {
        words.forEach(word => {
            if (word && typeof word === 'string') {
                const lowerWord = word.toLowerCase().trim();
                this.customBlocklist.add(lowerWord);
                this.filter.addWords(lowerWord);
            }
        });
    }

    /**
     * Remove words from the custom blocklist
     * @param {string[]} words - Array of words to unblock
     */
    removeWords(words) {
        words.forEach(word => {
            if (word && typeof word === 'string') {
                const lowerWord = word.toLowerCase().trim();
                this.customBlocklist.delete(lowerWord);
                this.filter.removeWords(lowerWord);
            }
        });
    }

    /**
     * Check if text contains profane words (default or custom)
     * @param {string} text - Text to check
     * @returns {boolean} - True if profane
     */
    isProfane(text) {
        if (!text) return false;
        return this.filter.isProfane(text);
    }

    /**
     * Clean text by replacing profane words with asterisks
     * @param {string} text - Text to clean
     * @returns {string} - Cleaned text
     */
    clean(text) {
        if (!text) return "";
        return this.filter.clean(text);
    }

    /**
     * Get all custom blocked words
     * @returns {string[]} - Array of custom blocked words
     */
    getCustomBlocklist() {
        return Array.from(this.customBlocklist);
    }
}

module.exports = new ProfanityFilter();
