// Get cursor position in the input
var properties = [
    'boxSizing',
    'width',  // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
    'height',
    'overflowX',
    'overflowY',  // copy the scrollbar for IE

    'borderTopWidth',
    'borderRightWidth',
    'borderBottomWidth',
    'borderLeftWidth',

    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',

    // https://developer.mozilla.org/en-US/docs/Web/CSS/font
    'fontStyle',
    'fontVariant',
    'fontWeight',
    'fontStretch',
    'fontSize',
    'lineHeight',
    'fontFamily',

    'textAlign',
    'textTransform',
    'textIndent',
    'textDecoration',  // might not make a difference, but better be safe

    'letterSpacing',
    'wordSpacing'
];

var isFirefox = !(window.mozInnerScreenX == null);
var mirrorDivDisplayCheckbox = document.getElementById('mirrorDivDisplay');
var mirrorDiv, computed, style;

function getCaretCoordinates(element, position) {
    // Create or reuse a mirror div
    let mirrorDiv = document.getElementById(element.nodeName + '--mirror-div');
    if (!mirrorDiv) {
        mirrorDiv = document.createElement('div');
        mirrorDiv.id = element.nodeName + '--mirror-div';
        document.body.appendChild(mirrorDiv);
    }

    const style = mirrorDiv.style;
    const computed = getComputedStyle(element);

    // Default textarea styles
    style.whiteSpace = 'pre-wrap'; // Preserve whitespace and line breaks
    if (element.nodeName !== 'INPUT') {
        style.overflowWrap = 'break-word'; // Only for textareas
    }

    // Position off-screen
    style.position = 'absolute';
    style.top = '0px'; // Ensure it is off-screen
    style.left = '-9999px'; // Ensure it does not interfere with the UI
    style.visibility = 'hidden'; // Hide it from the user

    // Copy relevant styles from the input
    const properties = [
        'font-family',
        'font-size',
        'font-style',
        'font-variant',
        'font-weight',
        'letter-spacing',
        'line-height',
        'text-transform',
        'word-spacing',
        'padding',
        'border',
        'box-sizing',
    ];

    properties.forEach(prop => {
        style[prop] = computed[prop];
    });

    if (element.nodeName === 'TEXTAREA') {
        style.width = computed.width; // Mirror the width for textareas
    }

    // Handle scroll height (Firefox fix)
    if (element.scrollHeight > parseInt(computed.height)) {
        style.overflowY = 'scroll';
    } else {
        style.overflow = 'hidden';
    }

    // Set the text up to the caret position
    mirrorDiv.textContent = element.value.substring(0, position).replace(/\s/g, "\u00a0"); // Replace spaces with non-breaking spaces

    // Add a span to determine caret position
    const span = document.createElement('span');
    span.textContent = element.value.substring(position) || '.'; // Handle empty span issue
    mirrorDiv.appendChild(span);

    // Get the span's coordinates
    const coordinates = {
        top: span.offsetTop + element.offsetTop,
        left: span.offsetLeft + element.offsetLeft,
    };

    // Cleanup: Remove the mirrorDiv after calculation
    document.body.removeChild(mirrorDiv);

    return coordinates;
}

let dictionary = [];

async function loadDictionary() {
    try {
        // Fetch the data from the file
        const response = await fetch('ranked_words.txt');
        const text = await response.text();

        // Process each line of the file
        dictionary = text.split('\n').map(line => {
            const [word, rank] = line.trim().split(/\s+/); // Split on whitespace
            return [word, parseInt(rank, 10)]; // Create an array with word and rank
        });
    } catch (error) {
        console.error("Error loading dictionary:", error);
    }
}

const quickSort = (arr) => {

    const sort = (left, right) => {
        if (left >= right) {
            return; // Base case: sub-array is already sorted
        }

        const pivotIndex = partition(left, right); // Partition the array

        sort(left, pivotIndex - 1); // Sort the left sub-array
        sort(pivotIndex + 1, right); // Sort the right sub-array
    };

    const partition = (left, right) => {
        const pivot = arr[right][1]; // Use the last element's rank as the pivot
        let i = left - 1;

        for (let j = left; j < right; j++) {
            if (arr[j][1] <= pivot) {
                i++;
                // Swap arr[i] and arr[j]
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        }

        // Swap the pivot with the element at i+1
        [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
        return i + 1; // Return the pivot's index
    };

    sort(0, arr.length - 1); // Start sorting from the whole array
};


function binarySearch(prefix) {
    console.log(prefix);
    
    let left = 0;
    let right = dictionary.length - 1;
    const results = [];
    let i = 0;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const word = dictionary[mid];

        if (word[0].toLowerCase().startsWith(prefix)) {

            for (i = mid; i >= 0 && dictionary[i][0].toLowerCase().startsWith(prefix); i--) results.push(dictionary[i]);
            for (i = mid + 1; i < dictionary.length && dictionary[i][0].toLowerCase().startsWith(prefix); i++) results.push(dictionary[i]);



            break;
        } else if (word[0].toLowerCase() < prefix.toLowerCase()) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }



    quickSort(results);

    return results.slice(0, 5).map(match => { return match[0] });
}

function linearSearch(prefix) {
    let index = 0;
    for (; index < dictionary.length; index++) {
        if (dictionary[index][0].toLowerCase().startsWith(prefix))
            break;
    }
    if (index == dictionary.length) return [];
    let results = [];
    while (index < dictionary.length && dictionary[index][0].toLowerCase().startsWith(prefix))
        results.push(dictionary[index++]);
    quickSort(results);


    return results.slice(0, 5).map(match => { return match[0] });
}

// Predict words based on the current input
function predictWords(prefix) {
    if (!prefix) return [];
    return binarySearch(prefix.toLowerCase());
    // return linearSearch(prefix.toLowerCase());
}

// Handle user input and update predictions
const textInput = document.getElementById('textInput');
const predictions = document.getElementById('predictions');

let debounceTimer;
textInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const text = textInput.value.split(' ').pop();
        updatePredictions(text);
    }, 100);
});




// Update dropdown position
function updateDropdownPosition() {
    const caretPosition = textInput.selectionEnd;
    console.log(getCaretCoordinates(textInput, caretPosition));
    
    const { top, left } = getCaretCoordinates(textInput, caretPosition);
    console.log("top: ",top," left: ",left);
    
    predictions.style.top = `${top - 40}px`;
    predictions.style.left = `${left - 40}px`;
}

function updatePredictions(text) {
    const predictionsList = predictWords(text);
    predictions.innerHTML = '';
    if (predictionsList.length === 0) {
        predictions.classList.add('hidden');
        return;
    }
    predictionsList.forEach(word => {
        const li = document.createElement('li');
        li.textContent = word;
        li.className = 'predictions-item';
        li.addEventListener('click', () => {
            const words = textInput.value.split(' ');
            words.pop();
            words.push(word);
            textInput.value = words.join(' ') + ' ';
            predictions.classList.add('hidden');
            textInput.focus();
        });
        predictions.appendChild(li);
    });
    predictions.classList.remove('hidden');
    updateDropdownPosition(); // Reposition the dropdown
}

textInput.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        event.preventDefault(); // Prevent default tab behavior
        const firstPrediction = predictions.querySelector('.predictions-item');
        if (firstPrediction) {
            firstPrediction.click();
        }
    }
});

// Initialize
loadDictionary();
