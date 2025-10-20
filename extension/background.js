// This function will be injected into the target page to fill the form.
function fillTheForm(username, password) {

  // Helper function to safely set the value on modern web frameworks
  const setReactInputValue = (element, value) => {
    const prototype = Object.getPrototypeOf(element);
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    } else {
      element.value = value;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // Helper function to wait for an element to appear in the DOM
  const waitForElement = (selector, callback) => {
    let attempts = 0;
    // ✅ CHANGED: Increased wait time from 5 to 10 seconds
    const maxAttempts = 100; // 100 attempts * 100ms = 10 seconds

    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        callback(element); // Found it
        return;
      }

      attempts++;
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        callback(null); // Timed out
      }
    }, 100);
  };

  // --- Selectors (Hybrid list for universal + specific sites) ---
  const usernameSelector = [
    'input[id="username"]', // For Snapchat
    'input[name="accountIdentifier"]', // For Snapchat
    'input[autocomplete="username"]',
    'input[name="text"]', // For X.com
    'input[formcontrolname="RegisterNumber"]', // For Sathyabama ERP
    'input[id="RegisterNumber"]', // For Sathyabama ERP
    'input[name*="user"]',
    'input[name*="login"]',
    'input[name*="email"]',
    'input[type="email"]'
  ].join(', ');

  const passwordSelector = [
    'input[autocomplete="current-password"]',
    'input[name="password"]', // For X.com & Snapchat password
    'input[formcontrolname="Password"]', // For Sathyabama ERP
    'input[name="Password"]', // For Sathyabama ERP
    'input[type="password"]'
  ].join(', ');


  // --- Main execution ---
  // 1. First, wait for the username field to exist.
  waitForElement(usernameSelector, (usernameField) => {
    if (!usernameField) {
      alert("Password Manager: Timed out waiting for login fields.");
      return;
    }

    // 2. Found username field, fill it.
    setReactInputValue(usernameField, username);

    // 3. Check if password field is ALSO present (for single-step logins)
    const passwordField = document.querySelector(passwordSelector);
    if (passwordField) {
      setReactInputValue(passwordField, password);
      return; // We're done, this was a single-step form.
    }

    // 4. It's a multi-step form. Start observing for the password field to appear.
    const observer = new MutationObserver((mutations, obs) => {
      const passwordFieldOnNextStep = document.querySelector(passwordSelector);
      if (passwordFieldOnNextStep) {
        // Found it! Fill it and stop observing.
        setReactInputValue(passwordFieldOnNextStep, password);
        obs.disconnect();
      }
    });

    // Watch the entire page for new elements being added.
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Disconnect after 15 seconds to prevent it from running forever.
    setTimeout(() => {
      observer.disconnect();
    }, 15000);
  });
}


// Listen for messages from the content script (unchanged)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEAMLESS_AUTOFILL') {
    let { username, password, targetUrl } = message.payload;

    // Create the new tab and wait for it to be ready
    chrome.tabs.create({ url: targetUrl, active: true }, (newTab) => {
      const listener = (tabId, changeInfo, tab) => {
        // Wait for the tab to be fully loaded
        if (tabId === newTab.id && changeInfo.status === 'complete') {
          // Inject the script
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: fillTheForm,
            args: [username, password],
          });
          // Clean up the listener
          chrome.tabs.onUpdated.removeListener(listener);
        }
      };
      chrome.tabs.onUpdated.addListener(listener);
    });
  }
});