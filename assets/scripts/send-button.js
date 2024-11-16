document.addEventListener('DOMContentLoaded', (event) => {
    const userInput = document.getElementById('user-input');

    // Trigger sendMessage when 'Enter' key is pressed in the input
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Function to set a question in the input field and send the message
function setQuestion(question) {
    const userInput = document.getElementById('user-input');
    userInput.value = question; // Set the question in the input field
    sendMessage(); // Call sendMessage to send the question
}

async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (message === '') return;

    const sendButton = document.getElementById('send-button');
    const responseOutput = document.getElementById('response-output');
    const suggestionsContainer = document.getElementById('suggestions-container'); // Access suggestions container

    // Show loading state on the button and clear previous response
    sendButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    sendButton.disabled = true;
    responseOutput.innerHTML = '';  // Clear previous response

    // Hide suggestions container as soon as message is sent
    if (suggestionsContainer) {
        suggestionsContainer.style.display = 'none';
    }

    let fullResponse = '';  // Variable to accumulate the actual response

    try {
        // Fetch API with streaming response
        const response = await fetch('https://mazis-resume-chatbot.azurewebsites.net/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: message }),
        });

        if (!response.body) throw new Error('ReadableStream not supported in this browser.');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        // Process each streamed chunk
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Decode and process the chunk
            const chunk = decoder.decode(value, { stream: true });

            // Skip the "INFO: getting information..." message
            if (chunk.includes("INFO: getting information...")) {
                continue;
            }

            // Append to the accumulated response
            fullResponse += chunk;

            // Show partial response (without parsing as Markdown for now)
            responseOutput.textContent = fullResponse;  // Show plain text as it streams in
        }

        // Once complete, parse the entire accumulated response as Markdown
        responseOutput.innerHTML = marked.parse(fullResponse);

        // Reset button state
        sendButton.innerHTML = '<i class="bi bi-send-fill"></i>';
        sendButton.disabled = false;

    } catch (error) {
        // Handle errors and reset button state
        sendButton.innerHTML = 'Send!';
        sendButton.disabled = false;
        console.error('Error:', error);
        responseOutput.textContent = 'Sorry, something went wrong. Please try again later.';
    }

    // Clear the input
    userInput.value = '';
}
