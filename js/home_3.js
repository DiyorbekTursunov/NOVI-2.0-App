// DOM elements
const chatContainer = document.getElementById("chat-container");
const messageInput = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
let isDisabled = false;

// API constants
const API_URL = "http://83.222.20.200:5000/ai";
const CSRF_TOKEN =
  "N8q096M9Cjb93GKTKQDd8FmMGGkIxPH8cjLzRUSGXCgck5Y3Qfiv7sybJYfbqjgC";

// Streaming simulation settings
const TYPING_SPEED_MIN = 1; // Minimum milliseconds per character
const TYPING_SPEED_MAX = 10; // Maximum milliseconds per character

// Local storage key for chat history
const CHAT_HISTORY_KEY = "chat_history";

// Function to save chat history to localStorage
function saveChatHistory() {
  const messages = [];
  const messageBoxes = chatContainer.querySelectorAll(".hero-box");

  messageBoxes.forEach((box) => {
    const text = box.querySelector(".hero-text").textContent;
    const isUser = box.classList.contains("down");
    messages.push({
      text,
      isUser,
    });
  });

  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
}

// Function to load chat history from localStorage
function loadChatHistory() {
  const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
  if (savedHistory) {
    const messages = JSON.parse(savedHistory);

    // Clear any default messages
    chatContainer.innerHTML = "";

    // Add each message to the chat
    messages.forEach((message) => {
      if (message.isUser) {
        addUserMessageWithoutSaving(message.text);
      } else {
        addAIMessageWithoutSaving(message.text);
      }
    });

    // Scroll to the bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }
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

  // Scroll to the bottom of the chat
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to add a completed AI message to the chat
function addAIMessage(text) {
  addAIMessageWithoutSaving(text);

  // Save updated chat history
  saveChatHistory();

  // Scroll to the bottom of the chat
  chatContainer.scrollTop = chatContainer.scrollHeight;
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
  chatContainer.scrollTop = chatContainer.scrollHeight;

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
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } else {
        // Finished typing
        cursor.remove();

        // Save chat history after message is complete
        saveChatHistory();
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
  chatContainer.scrollTop = chatContainer.scrollHeight;
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

  // Show loading indicator
  showLoading();

  try {
    // Prepare the data to send as JSON
    const data = {
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
      roomId: "681185bb93e8221377fb3996",
    };

    messageInput.setAttribute("disabled", "true");
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
    const aiResponse = responseData.response;

    console.log(aiResponse);

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
  } finally {
    messageInput.removeAttribute("disabled");
  }
}

// Event listeners
sendButton.addEventListener("click", () => {
  sendMessage(messageInput.value);
});

messageInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage(messageInput.value);
  }
});

// Initialize - either load chat history or show welcome message
window.addEventListener("DOMContentLoaded", async () => {
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
});

// Optional: Clear chat history function (you can add a button for this if needed)
function clearChatHistory() {
  localStorage.removeItem(CHAT_HISTORY_KEY);
  chatContainer.innerHTML = "";

  // Show welcome message again
  const { messageText, cursor } = createAIMessageContainer();
  simulateStreamingText(
    "Hello! How can I assist you today?",
    messageText,
    cursor
  );
}

const input = document.querySelector(".footer-input");

input.addEventListener("focus", () => {
  // Delay to wait for the keyboard to open
  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 300); // Adjust delay as needed (300-500ms is usually safe)
});
