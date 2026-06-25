// ----- DOM References -----
const quoteDisplay = document.getElementById('quote-display');
const typingInput = document.getElementById('typing-input');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const progressEl = document.getElementById('progress');
const newQuoteBtn = document.getElementById('new-quote-btn');
const resetBtn = document.getElementById('reset-btn');
const resultModal = document.getElementById('result-modal');
const resultWpm = document.getElementById('result-wpm');
const resultAccuracy = document.getElementById('result-accuracy');
const resultTime = document.getElementById('result-time');
const modalCloseBtn = document.getElementById('modal-close-btn');

// ----- State -----
let quotes = [
    "The only way to do great work is to love what you do.",
    "Life is what happens when you are busy making other plans.",
    "In the middle of difficulty lies opportunity.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It does not matter how slowly you go as long as you do not stop.",
    "The best time to plant a tree was twenty years ago. The second best time is now.",
    "Creativity is intelligence having fun.",
    "Simplicity is the ultimate sophistication.",
    "The only impossible journey is the one you never begin."
];

let currentQuote = '';
let characters = [];           // array of { char, status: 'pending'|'correct'|'incorrect' }
let currentIndex = 0;
let timer = 0;
let timerInterval = null;
let isStarted = false;
let isFinished = false;
let totalCorrect = 0;
let totalTyped = 0;

// ----- Helpers -----
function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

// Build the display spans from the quote string
function renderQuote(quote) {
    quoteDisplay.innerHTML = '';
    characters = quote.split('').map((ch) => ({
        char: ch,
        status: 'pending'
    }));
    characters.forEach((charObj, idx) => {
        const span = document.createElement('span');
        span.textContent = charObj.char === ' ' ? '\u00A0' : charObj.char; // preserve spaces
        span.className = 'char pending';
        span.dataset.index = idx;
        quoteDisplay.appendChild(span);
    });
    currentIndex = 0;
    totalCorrect = 0;
    totalTyped = 0;
    isFinished = false;
    clearTimer();
    timer = 0;
    timerEl.textContent = '0s';
    wpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    progressEl.textContent = `0/${characters.length}`;
    resultModal.classList.remove('visible');
    // Set first char as current
    if (characters.length > 0) {
        const firstSpan = quoteDisplay.querySelector(`[data-index="0"]`);
        if (firstSpan) firstSpan.classList.add('current');
    }
}

// Update the display of all character spans
function updateDisplay() {
    const spans = quoteDisplay.querySelectorAll('.char');
    spans.forEach((span, idx) => {
        span.className = 'char';
        const status = characters[idx]?.status || 'pending';
        span.classList.add(status);
        if (idx === currentIndex && !isFinished) {
            span.classList.add('current');
        }
    });
}

// Timer control
function startTimer() {
    if (isStarted) return;
    isStarted = true;
    timerInterval = setInterval(() => {
        timer++;
        timerEl.textContent = `${timer}s`;
    }, 1000);
}

function clearTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isStarted = false;
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isStarted = false;
}

// Calculate WPM: (correct characters / 5) / (minutes)
function calculateWPM() {
    const minutes = timer / 60;
    if (minutes === 0) return 0;
    return Math.round((totalCorrect / 5) / minutes);
}

// Calculate accuracy: correct / totalTyped * 100
function calculateAccuracy() {
    if (totalTyped === 0) return 100;
    return Math.round((totalCorrect / totalTyped) * 100);
}

// Update stats
function updateStats() {
    wpmEl.textContent = calculateWPM();
    accuracyEl.textContent = `${calculateAccuracy()}%`;
    progressEl.textContent = `${currentIndex}/${characters.length}`;
}

// Check if quote is fully typed
function checkFinish() {
    if (currentIndex >= characters.length && !isFinished) {
        isFinished = true;
        stopTimer();
        // Show result modal
        resultWpm.textContent = calculateWPM();
        resultAccuracy.textContent = `${calculateAccuracy()}%`;
        resultTime.textContent = `${timer}s`;
        resultModal.classList.add('visible');
    }
}

// ----- Core: Handle user input -----
function handleInput(e) {
    // If finished, ignore further typing
    if (isFinished) return;

    const inputChar = e.data; // the character just typed
    // If input is null (e.g., backspace or control), ignore
    if (inputChar === null || inputChar === undefined) {
        // We still want to clear the input value for backspace, but we don't process it.
        typingInput.value = '';
        return;
    }

    // Start timer on first character
    if (!isStarted && inputChar.trim() !== '') {
        startTimer();
    }

    // If we've already typed all chars, ignore further input
    if (currentIndex >= characters.length) {
        typingInput.value = '';
        return;
    }

    const expectedChar = characters[currentIndex].char;
    const isCorrect = (inputChar === expectedChar);

    // Record stats
    totalTyped++;
    if (isCorrect) totalCorrect++;

    // Update character status
    characters[currentIndex].status = isCorrect ? 'correct' : 'incorrect';
    
    // Move to next character
    currentIndex++;

    // Update the DOM spans
    updateDisplay();
    updateStats();

    // Clear input for next character
    typingInput.value = '';

    // Check if quote is complete
    checkFinish();
}

// ----- Reset / New Quote -----
function loadNewQuote() {
    const newQuote = getRandomQuote();
    currentQuote = newQuote;
    renderQuote(newQuote);
    stopTimer();
    timer = 0;
    timerEl.textContent = '0s';
    wpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    progressEl.textContent = `0/${characters.length}`;
    isStarted = false;
    isFinished = false;
    typingInput.value = '';
    typingInput.focus();
    resultModal.classList.remove('visible');
    updateDisplay();
}

function resetTest() {
    // Reload the same quote
    renderQuote(currentQuote);
    stopTimer();
    timer = 0;
    timerEl.textContent = '0s';
    wpmEl.textContent = '0';
    accuracyEl.textContent = '100%';
    progressEl.textContent = `0/${characters.length}`;
    isStarted = false;
    isFinished = false;
    typingInput.value = '';
    typingInput.focus();
    resultModal.classList.remove('visible');
    updateDisplay();
}

// ----- Event Listeners -----
typingInput.addEventListener('input', handleInput);

// Clicking on the quote box focuses the hidden input
quoteDisplay.addEventListener('click', () => {
    typingInput.focus();
});

newQuoteBtn.addEventListener('click', loadNewQuote);
resetBtn.addEventListener('click', resetTest);
modalCloseBtn.addEventListener('click', () => {
    resultModal.classList.remove('visible');
    resetTest();
});

// Close modal by clicking backdrop
resultModal.addEventListener('click', (e) => {
    if (e.target === resultModal) {
        resultModal.classList.remove('visible');
        resetTest();
    }
});

// Focus input on page load
window.addEventListener('load', () => {
    loadNewQuote();
    typingInput.focus();
});
