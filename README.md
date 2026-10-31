# Word Suggestion

A lightweight word suggestion application built using HTML, CSS, and vanilla JavaScript.

The application provides real-time word suggestions as the user types. It uses a preprocessed word list sorted alphabetically while preserving the original word frequency rankings.

## Features

- **Real-time Suggestions:** Displays word suggestions as the user types.
- **Frequency-Based Ranking:** Prioritizes commonly used words over less frequently used ones.
- **Binary Search:** Efficiently locates the starting position of words matching the typed prefix.
- **Prefix Matching:** Expands around the matched position to collect all words starting with the entered characters.
- **Dynamic Ranking:** Sorts matching words based on their original frequency rank.
- **Lightweight:** Built using plain JavaScript, HTML, and CSS without external libraries.

## How It Works

1. A word list containing words ordered by usage frequency is preprocessed.
2. The words are alphabetically sorted while retaining their original frequency ranks.
3. When the user types, JavaScript extracts the current partially typed word.
4. Binary search locates a matching word that starts with the entered prefix.
5. The application scans left and right from that position to collect all matching words.
6. The matching words are sorted by their original frequency rank.
7. Suggestions are displayed dynamically as the user types.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Binary Search Algorithm

## Getting Started

1. Clone the repository:

   ```bash
   git clone git@github.com:HarshithPancheru/Text-Prediction.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Text-Prediction
   ```

3. Open `index.html` in your browser.

No dependencies or build tools are required.

## Purpose

Built as an experiment in efficient word lookup and real-time text suggestions. The project explores binary search, prefix matching, data preprocessing, and frequency-based ranking without relying on external libraries.
