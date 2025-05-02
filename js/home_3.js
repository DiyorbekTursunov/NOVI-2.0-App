// DOM elements
const chatContainer = document.getElementById("chat-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const footerContainer = document.querySelector(".footer-container");

// API constants
const API_URL = "https://fix-cors-for-novi.vercel.app/api/proxy";
const CSRF_TOKEN =
  "N8q096M9Cjb93GKTKQDd8FmMGGkIxPH8cjLzRUSGXCgck5Y3Qfiv7sybJYfbqjgC";

// Streaming simulation settings
const TYPING_SPEED_MIN = 1; // Minimum milliseconds per character
const TYPING_SPEED_MAX = 10; // Maximum milliseconds per character

// Local storage keys
const CHAT_HISTORY_KEY = "chat_history";
const ARCHIVED_MESSAGES_KEY = "archived_messages";

// Maximum number of visible messages
const MAX_VISIBLE_MESSAGES = 2; // Only show the most recent exchange (user message + AI response)

// Function to save chat history to localStorage
function saveChatHistory() {
  // Get visible messages from the DOM
  const visibleMessages = [];
  const messageBoxes = chatContainer.querySelectorAll(".hero-box");

  messageBoxes.forEach((box) => {
    const text = box.querySelector(".hero-text").textContent;
    const isUser = box.classList.contains("down");
    visibleMessages.push({
      text,
      isUser,
    });
  });

  // Get archived messages from localStorage
  let archivedMessages = [];
  const archivedMessagesJSON = localStorage.getItem(ARCHIVED_MESSAGES_KEY);
  if (archivedMessagesJSON) {
    archivedMessages = JSON.parse(archivedMessagesJSON);
  }

  // Combine visible and archived messages to create complete history
  const allMessages = [...archivedMessages, ...visibleMessages];

  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(allMessages));
}

// Function to load chat history from localStorage
function loadChatHistory() {
  const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
  if (savedHistory) {
    const messages = JSON.parse(savedHistory);

    // Clear any default messages
    chatContainer.innerHTML = "";

    // Get only the most recent MAX_VISIBLE_MESSAGES
    const recentMessages = messages.slice(-MAX_VISIBLE_MESSAGES);

    // Archive older messages
    const olderMessages = messages.slice(0, -MAX_VISIBLE_MESSAGES);
    if (olderMessages.length > 0) {
      localStorage.setItem(ARCHIVED_MESSAGES_KEY, JSON.stringify(olderMessages));
    }

    // Add only the recent messages to the visible chat
    recentMessages.forEach((message) => {
      if (message.isUser) {
        addUserMessageWithoutSaving(message.text);
      } else {
        addAIMessageWithoutSaving(message.text);
      }
    });

    // Scroll to the bottom initially to show the most recent messages
    scrollToBottom();
  }
}

// Function to update message visibility
function updateMessageVisibility() {
  const allMessages = chatContainer.querySelectorAll(".hero-box");

  if (allMessages.length <= MAX_VISIBLE_MESSAGES) {
    // If we have 2 or fewer messages, nothing to do
    return;
  }

  // Get all messages except the most recent MAX_VISIBLE_MESSAGES
  const oldMessages = Array.from(allMessages).slice(0, -MAX_VISIBLE_MESSAGES);

  // Archive the messages we're about to remove
  const archivedMessages = [];
  let existingArchived = [];

  // Get existing archived messages
  const archivedMessagesJSON = localStorage.getItem(ARCHIVED_MESSAGES_KEY);
  if (archivedMessagesJSON) {
    existingArchived = JSON.parse(archivedMessagesJSON);
  }

  // Add the messages we're about to remove to the archive
  oldMessages.forEach(msg => {
    const text = msg.querySelector(".hero-text").textContent;
    const isUser = msg.classList.contains("down");
    archivedMessages.push({
      text,
      isUser,
    });
  });

  // Update archived messages in localStorage
  localStorage.setItem(ARCHIVED_MESSAGES_KEY,
    JSON.stringify([...existingArchived, ...archivedMessages]));

  // Remove old messages from the DOM
  oldMessages.forEach(msg => {
    chatContainer.removeChild(msg);
  });
}

// Function to add a user message to the chat without saving (for history restoration)
function addUserMessageWithoutSaving(text) {
  const messageBox = document.createElement("div");
  messageBox.classList.add("hero-box", "down");

  const messageText = document.createElement("p");
  messageText.classList.add("hero-text");
  messageText.textContent = text;

  messageBox.appendChild(messageText);
  chatContainer.appendChild(messageBox);
}

// Function to add an AI message without saving (for history restoration)
function addAIMessageWithoutSaving(text) {
  const messageBox = document.createElement("div");
  messageBox.classList.add("hero-box", "up");

  const messageText = document.createElement("p");
  messageText.classList.add("hero-text");
  messageText.textContent = text;

  messageBox.appendChild(messageText);
  chatContainer.appendChild(messageBox);
}

// Function to add a user message to the chat
function addUserMessage(text) {
  addUserMessageWithoutSaving(text);

  // Save updated chat history
  saveChatHistory();

  // Update message visibility immediately after user sends a message
  updateMessageVisibility();

  // Scroll to the bottom of the chat
  scrollToBottom();
}

// Improved scroll to bottom function
function scrollToBottom() {
  // Use requestAnimationFrame for smoother scrolling and to ensure DOM updates first
  requestAnimationFrame(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Ensure messages are visible by adding a small delay
    setTimeout(() => {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 50);
  });
}

// Function to add a completed AI message to the chat
function addAIMessage(text) {
  addAIMessageWithoutSaving(text);

  // Save updated chat history
  saveChatHistory();

  // Update message visibility
  updateMessageVisibility();

  // Scroll to the bottom of the chat
  scrollToBottom();
}

// Function to create an AI message container with cursor
function createAIMessageContainer() {
  const messageBox = document.createElement("div");
  messageBox.classList.add("hero-box", "up");
  messageBox.id = "current-ai-message";

  const messageText = document.createElement("p");
  messageText.classList.add("hero-text");
  messageBox.appendChild(messageText);

  // Add typing cursor
  const cursor = document.createElement("span");
  cursor.classList.add("cursor");
  messageText.appendChild(cursor);

  chatContainer.appendChild(messageBox);

  // Update message visibility when the AI starts typing
  // We don't need this here since it's already handled in sendMessage
  // updateMessageVisibility();

  scrollToBottom();

  return { messageBox, messageText, cursor };
}

// Function to simulate streaming text animation
function simulateStreamingText(text, messageElement, cursor) {
  return new Promise((resolve) => {
    let index = 0;
    const characters = text.split("");

    function typeNextCharacter() {
      if (index < characters.length) {
        const textNode = document.createTextNode(characters[index]);
        messageElement.insertBefore(textNode, cursor);
        index++;

        // Random typing speed for more natural effect
        const typingSpeed =
          Math.floor(
            Math.random() * (TYPING_SPEED_MAX - TYPING_SPEED_MIN + 1)
          ) + TYPING_SPEED_MIN;

        setTimeout(typeNextCharacter, typingSpeed);
        scrollToBottom();
      } else {
        // Finished typing
        cursor.remove();

        // Save chat history after message is complete
        saveChatHistory();

        // Update message visibility after typing is complete
        updateMessageVisibility();

        resolve();
      }
    }

    typeNextCharacter();
  });
}

// Function to show loading indicator
function showLoading() {
  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("loading");
  loadingDiv.id = "loading-indicator";

  const dotsDiv = document.createElement("div");
  dotsDiv.classList.add("loading-dots");

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    dotsDiv.appendChild(dot);
  }

  loadingDiv.appendChild(dotsDiv);
  chatContainer.appendChild(loadingDiv);
  scrollToBottom();
}

// Function to hide loading indicator
function hideLoading() {
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

// Function to toggle button active state
function toggleButtonActive(active) {
  if (active) {
    sendButton.classList.add("active");
  } else {
    sendButton.classList.remove("active");
  }
}

// Monitor input field for content
messageInput.addEventListener("input", function () {
  toggleButtonActive(this.value.trim().length > 0);
});

// Function to send message to API
async function sendMessage(message) {
  if (!message.trim()) return;

  // Add user message to chat
  addUserMessage(message);

  // Clear input field
  messageInput.value = "";
  toggleButtonActive(false);

  // IMPORTANT: The key fix - update message visibility immediately after sending
  // Even before showing loading or starting AI response
  updateMessageVisibility();

  // Show loading indicator
  showLoading();

  try {
    // Prepare the data to send as JSON
    const data = {
      message: message,
    };

    // Use fetch API to send the POST request
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Set content-type to application/json
        "X-CSRFTOKEN": CSRF_TOKEN,
        Accept: "application/json",
      },
      body: JSON.stringify(data), // Send data as JSON
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseData = await response.json();
    const aiResponse = responseData.ai_response;

    // Hide loading indicator
    hideLoading();

    // Create AI message container with cursor
    const { messageText, cursor } = createAIMessageContainer();

    // Simulate streaming text
    await simulateStreamingText(aiResponse, messageText, cursor);
  } catch (error) {
    console.error("Error:", error);

    // Hide loading indicator
    hideLoading();

    // Show error message with streaming effect
    const { messageText, cursor } = createAIMessageContainer();
    await simulateStreamingText(
      "Sorry, there was an error processing your request. Please try again.",
      messageText,
      cursor
    );
  }
}

// Fix for mobile keyboard issue
function handleVisualViewport() {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      // Adjust footer position based on visual viewport height
      document.body.style.height = `${window.visualViewport.height}px`;

      // Always scroll to bottom when viewport changes (keyboard appears/disappears)
      if (document.activeElement === messageInput) {
        // Use a double scroll technique with delay to ensure messages are visible
        scrollToBottom();
        setTimeout(scrollToBottom, 100); // Additional scroll after layout stabilizes
      }
    });
  }
}

// Focus handling to ensure proper scrolling when keyboard appears/disappears
messageInput.addEventListener('focus', () => {
  // Multiple scrolls with increasing delays to ensure messages stay visible
  // as the keyboard appears and the layout adjusts
  scrollToBottom();
  setTimeout(scrollToBottom, 100);
  setTimeout(scrollToBottom, 300);
  setTimeout(scrollToBottom, 500);
});

// Event listeners
sendButton.addEventListener("click", () => {
  sendMessage(messageInput.value);
});

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage(messageInput.value);
    event.preventDefault(); // Prevent default to avoid line breaks in input
  }
});

// Initialize - either load chat history or show welcome message
window.addEventListener("DOMContentLoaded", async () => {
  // Initialize visual viewport handler for mobile
  handleVisualViewport();

  // Check if we have saved chat history
  const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);

  if (savedHistory && JSON.parse(savedHistory).length > 0) {
    // Load saved chat history
    loadChatHistory();
  } else {
    // Show welcome message with streaming effect
    const { messageText, cursor } = createAIMessageContainer();
    await simulateStreamingText(
      "Hello! How can I assist you today?",
      messageText,
      cursor
    );
  }

  // Apply initial scroll to bottom to ensure all content is visible
  scrollToBottom();
});

// Optional: Clear chat history function (you can add a button for this if needed)
function clearChatHistory() {
  localStorage.removeItem(CHAT_HISTORY_KEY);
  localStorage.removeItem(ARCHIVED_MESSAGES_KEY);
  chatContainer.innerHTML = "";

  // Show welcome message again
  const { messageText, cursor } = createAIMessageContainer();
  simulateStreamingText(
    "Hello! How can I assist you today?",
    messageText,
    cursor
  );
}
