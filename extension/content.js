// This script runs on your password manager website (e.g., localhost:5173)

// 1. Listen for the 'autofillRequest' event we created in the React app.
window.addEventListener('autofillRequest', (event) => {
  const credentials = event.detail;
  
  // 2. When the event is heard, send a message to our extension's background script.
  chrome.runtime.sendMessage({
    type: 'SEAMLESS_AUTOFILL',
    payload: credentials
  });
});