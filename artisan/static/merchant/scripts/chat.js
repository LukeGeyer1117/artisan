import { aiMessage } from "./common.js";
import { getCookie } from "./csrf.js";

const csrftoken = getCookie('csrftoken');

document.addEventListener('DOMContentLoaded', function () {
  const toggles = document.querySelectorAll('.chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      panel.classList.remove('hidden');
    });
  })

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  // Listen for send button to be clicked
  const messageButton = document.querySelector('.msg-button');
  const messageInput = document.querySelector('.msg-input');

  const emptyChatDiv = document.getElementById('empty-chat-div');
  const messageDiv = document.getElementById('msgs-div');

  loadMessages(messageDiv, emptyChatDiv);

  messageButton.addEventListener('click', function () {
    if (messageInput.value) {
      messageButton.disabled = true;
      const message = messageInput.value;
      messageInput.value = '';
      SendUserMessage(message, emptyChatDiv, messageDiv, messageButton);
    }
  })

  // Listen for chat to be cleared
  const clearBtn = document.getElementById('reset-chat-button');
  clearBtn.addEventListener('click', function () {
    const confirmed = window.confirm('Are you sure you would like to start a new chat?');

    if (confirmed) {
      localStorage.removeItem('chat_messages');

      window.location.reload();
    }
  })
})

async function SendUserMessage(message, emptyChatDiv, messageDiv, messageButton) {
  emptyChatDiv.classList.add('hidden');
  messageDiv.classList.remove('hidden');

  const now = Date.now();

  const newMessage = {
    role: "user",
    content: message,
    timestamp: now
  };

  // Get existing messages
  let messages = JSON.parse(localStorage.getItem('chat_messages')) || [];

  // Add new message
  messages.push(newMessage);

  // Sort by timestamp (future-proofing)
  messages.sort((a, b) => a.timestamp - b.timestamp);

  // Save back to localStorage
  localStorage.setItem('chat_messages', JSON.stringify(messages));

  // Render just the new message
  renderMessage(newMessage, messageDiv);

  const reply = await aiMessage(csrftoken, messages);
  console.log(reply);

  const replyMsg = {
    role: "assistant", 
    content: reply,
    timestamp: now
  }
  messages.push(replyMsg);
  messages.sort((a, b) => a.timestamp - b.timestamp);
  localStorage.setItem('chat_messages', JSON.stringify(messages));

  renderMessage(replyMsg, messageDiv);

  messageButton.disabled = false;

  messageDiv.scrollTop = messageDiv.scrollHeight;
}

function renderMessage(msg, messageDiv) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const alignment = msg.role === "user" ? "chat-end" : "chat-start";
  const bubbleStyle = msg.role === "user"
    ? "chat-bubble-primary"
    : "";

  const senderLabel = msg.role === "user" ? "You" : "Assistant";

  // Create unique ID so we can target this specific bubble
  const bubbleId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  messageDiv.insertAdjacentHTML('beforeend', `
    <div class="chat ${alignment}">
      <div class="chat-header">
        ${senderLabel} - ${time}
      </div>
      <div id="${bubbleId}" class="chat-bubble ${bubbleStyle}">
        ${msg.role === "assistant"
          ? `<span class="loading loading-dots loading-sm"></span>`
          : msg.content}
      </div>
    </div>
  `);

  // If assistant, replace loading with actual content after 3 seconds
  if (msg.role === "assistant") {
    setTimeout(() => {
      const bubble = document.getElementById(bubbleId);
      if (bubble) {
        bubble.innerHTML = msg.content;
      }
    }, 3000);
  }
}


function loadMessages(messageDiv, emptyChatDiv) {
  const messages = JSON.parse(localStorage.getItem('chat_messages')) || [];

  if (messages.length === 0) {
    emptyChatDiv.classList.remove('hidden');
    return;
  }

  emptyChatDiv.classList.add('hidden');
  messageDiv.classList.remove('hidden');

  messages
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach(msg => renderMessage(msg, messageDiv));

  messageDiv.scrollTop = messageDiv.scrollHeight;
}
