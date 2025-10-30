// This function will be injected into the target page to fill the form.
function fillTheForm(username, password) {
  
  // A robust function to set an input's value on modern frameworks like React.
  const setReactInputValue = (element, value) => {
    // Find the prototype of the input element.
    const prototype = Object.getPrototypeOf(element);
    
    // Get the native 'value' setter from the prototype. This is what React uses internally.
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
    
    // Call the native setter with the element and the new value.
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else {
      // Fallback for non-React sites.
      element.value = value;
    }

    // Dispatch an 'input' event to ensure all listeners (like floating labels) are triggered.
    element.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // Try to find the username/email and password fields using common attributes.
  const usernameField = document.querySelector(
    'input[name="username"], input[type="text"], input[name*="email"], input[type="email"], input[autocomplete="username"]'
  );
  const passwordField = document.querySelector(
    'input[type="password"], input[name*="pass"], input[name="password"], input[autocomplete="current-password"]'
  );

  if (usernameField && passwordField) {
    setReactInputValue(usernameField, username);
    setReactInputValue(passwordField, password);
  } else {
    alert('Could not find username or password fields on this page.');
  }
}


// This function is called when a user clicks a password in the popup list.
async function autofill(username, password) {
  // Get the current active tab.
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Execute the 'fillTheForm' function on that tab.
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: fillTheForm,
    args: [username, password],
  });

  // Close the popup window.
  window.close();
}


// This runs as soon as the popup window is opened.
document.addEventListener('DOMContentLoaded', async () => {
  const listElement = document.getElementById('passwords-list');

  try {
    const res = await fetch('https://password-manager-app-t77e.onrender.com/passwords', { credentials: 'include' });

    if (res.status === 401) {
      listElement.innerHTML = '<li class="error-message">Error: Please log in to your password manager first.</li>';
      return;
    }
    if (!res.ok) {
        throw new Error("Server responded with an error.");
    }

    const passwords = await res.json();
    listElement.innerHTML = ''; // Clear the "Loading..." message

    if (passwords.length === 0) {
      listElement.innerHTML = '<li class="error-message">No passwords saved yet.</li>';
      return;
    }

    // Create a list item for each password.
    passwords.forEach(p => {
      const item = document.createElement('li');
      item.textContent = `${p.website} (${p.username})`;
      item.onclick = () => {
        autofill(p.username, p.password);
      };
      listElement.appendChild(item);
    });

  } catch (e) {
    console.error("Fetch error:", e);
    listElement.innerHTML = '<li class="error-message">Error: Could not connect to the backend server. Is it running?</li>';
  }
});