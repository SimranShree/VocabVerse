// Fetch and display word definition
function fetchDefinition(word) {
    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(response => response.json())
        .then(data => {
            if (data.title === "No Definitions Found") {
                document.getElementById('result').innerHTML = `<p>No definition found for "${word}".</p>`;
            } else {
                const definition = data[0].meanings[0].definitions[0].definition;
                document.getElementById('result').innerHTML = `
                    <h2>${word}</h2>
                    <p>${definition}</p>
                    <div id="suggestions-container"></div>
                `;
                fetchSimilarWords(word);
            }
        })
        .catch(() => {
            document.getElementById('result').innerHTML = `<p>Failed to fetch definition. Please try again.</p>`;
        });
}

// Fetch similar words and display them as clickable suggestions
function fetchSimilarWords(word) {
    fetch(`https://api.datamuse.com/words?ml=${word}`)
        .then(response => response.json())
        .then(data => {
            const suggestionsContainer = document.getElementById('suggestions-container');
            suggestionsContainer.innerHTML = '<h3>Related Words:</h3>';
            const suggestions = data.slice(0, 10); // Get top 10 suggestions

            // Filter suggestions to only include words with definitions
            const promises = suggestions.map(item =>
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${item.word}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.title !== "No Definitions Found") {
                            return item.word;
                        }
                    })
            );

            Promise.all(promises)
                .then(results => {
                    suggestionsContainer.innerHTML = '';
                    results.filter(Boolean).forEach(word => {
                        const suggestionElement = document.createElement('p');
                        suggestionElement.className = 'suggestion';
                        suggestionElement.textContent = word;
                        suggestionElement.addEventListener('click', () => fetchDefinition(word));
                        suggestionsContainer.appendChild(suggestionElement);
                    });
                })
                .catch(error => console.error('Error fetching similar words:', error));
        })
        .catch(error => console.error('Error fetching similar words:', error));
}

// Event listener for the search button
document.getElementById('search-button').addEventListener('click', function() {
    const word = document.getElementById('search-input').value;
    if (word) {
        fetchDefinition(word);
    } else {
        document.getElementById('result').innerHTML = `<p>Please enter a word to search.</p>`;
    }
});

// Event listener for input to fetch suggestions
document.getElementById('search-input').addEventListener('input', function() {
    const query = this.value;
    if (query) {
        fetch(`https://api.datamuse.com/sug?s=${query}`)
            .then(response => response.json())
            .then(data => {
                const suggestions = data.map(item => item.word).slice(0, 10);
                const datalist = document.getElementById('suggestions');
                datalist.innerHTML = '';
                suggestions.forEach(word => {
                    const option = document.createElement('option');
                    option.value = word;
                    datalist.appendChild(option);
                });
            })
            .catch(error => console.error('Error fetching suggestions:', error));
    }
});
