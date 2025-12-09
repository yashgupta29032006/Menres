const profanityFilter = require('../utils/filter');
const assert = require('assert');

console.log('Running Filter Tests...');

// Test 1: Default Blocklist
assert.strictEqual(profanityFilter.isProfane('hell'), true, 'Should detect default bad words');
assert.strictEqual(profanityFilter.isProfane('hello'), false, 'Should allow normal words');
console.log('✓ Default Blocklist passed');

// Test 2: Custom Blocklist Adding
profanityFilter.addWords(['apple', 'banana']);
assert.strictEqual(profanityFilter.isProfane('apple'), true, 'Should detect custom blocked word "apple"');
assert.strictEqual(profanityFilter.isProfane('I like banana'), true, 'Should detect custom blocked word "banana" in sentence');
console.log('✓ Custom Blocklist Adding passed');

// Test 3: Custom Blocklist Removing
profanityFilter.removeWords(['apple']);
assert.strictEqual(profanityFilter.isProfane('apple'), false, 'Should allow "apple" after removal');
assert.strictEqual(profanityFilter.isProfane('banana'), true, 'Should still block "banana"');
console.log('✓ Custom Blocklist Removing passed');

// Test 4: Cleaning
const cleaned = profanityFilter.clean('This is a banana');
assert.strictEqual(cleaned.includes('banana'), false, 'Should clean bad words');
assert.strictEqual(cleaned.includes('******'), true, 'Should replace with asterisks');
console.log('✓ Cleaning passed');

console.log('All tests passed!');
