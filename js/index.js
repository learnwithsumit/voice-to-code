// Speech Recognition API Setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.continuous = true;
recognition.lang = 'en-US';

// Select DOM elements
const start = document.querySelector('#start');
const stop = document.querySelector('#stop');
const status = document.querySelector('#status');
const preview = document.querySelector('#preview');
const command = document.querySelector('#command');
const styleTag = document.createElement('style');

// variables
let htmlString = '';
const accuracy = 0.7;

// functions
const handleStart = () => {
    status.innerText = 'Talking';
    command.innerText = '';
    status.classList.add('blink');
    recognition.start();
};
const handleStop = () => {
    status.innerText = 'Not Talking';
    command.innerText = '';
    status.classList.remove('blink');
    recognition.stop();
};

const handleUnrecognized = () => {
    status.innerText = 'Not Talking';
    command.innerText = 'Could not understand your command!';
    status.classList.remove('blink');
    recognition.stop();
};

const processResult = (result) => {
    const processed = result.trim().toLowerCase();
    if (processed.includes('html')) {
        if (processed.includes('content')) {
            const [, content] = processed.split('html content ');
            htmlString += content;
        } else if (processed.includes('open')) {
            const [, tag] = processed.split('html open ');
            htmlString += `<${tag}>`;
        } else if (processed.includes('close')) {
            const [, tag] = processed.split('html close ');
            htmlString += `</${tag}>`;
            preview.innerHTML += htmlString;
            htmlString = '';
        }
    } else if (processed.includes('css')) {
        if (processed.includes('open')) {
            const [, tag] = processed.split('css open ');
            styleTag.innerHTML += `${tag} {`;
        } else if (processed.includes('close')) {
            styleTag.innerHTML += '}';
        } else if (processed.includes('style')) {
            const [, payload] = processed.split('css style ');
            if (payload) {
                const [prop, value] = payload
                    .replaceAll('colour', 'color')
                    .replaceAll(' pixels', 'px')
                    .replaceAll(' ', '-')
                    .split('-is-');
                if (prop && value) {
                    styleTag.innerHTML += `${prop}:${value};`;
                }
            }
        }
    } else {
        handleUnrecognized();
    }
};

const handleResults = (event) => {
    const { results, resultIndex } = event;
    const { transcript, confidence } = results[resultIndex][0];
    if (confidence > accuracy) {
        command.innerHTML = `Command: ${transcript}`;
        processResult(transcript);
    }
};

// add the css style tag
document.head.appendChild(styleTag);

// add event listeners
start.addEventListener('click', handleStart);
stop.addEventListener('click', handleStop);
recognition.addEventListener('result', handleResults);
