document.addEventListener('DOMContentLoaded', (event) => {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});


function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (message === '') return;

    const sendButton = document.getElementById('send-button');

    // Show loading state on the button
    sendButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
    sendButton.disabled = true;

    // Call the API
    fetch('https://resume-chatbot-latest.onrender.com/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: message }),
    })
        .then(response => response.json())
        .then(data => {
            // Hide loading state on the button
            sendButton.innerHTML = '<i class="bi bi-send-fill"></i>';
            sendButton.disabled = false;
            // Display bot's response
            displayResponse(data.prediction);
        })
        .catch(error => {
            // Hide loading state on the button
            sendButton.innerHTML = 'Send!';
            sendButton.disabled = false;
            console.error('Error:', error);
            displayResponse('Sorry, something went wrong. Please try again later.');
        });

    // Clear the input
    userInput.value = '';
}

function displayResponse(response) {
    const responseOutput = document.getElementById('response-output');
    responseOutput.textContent = response;
}
