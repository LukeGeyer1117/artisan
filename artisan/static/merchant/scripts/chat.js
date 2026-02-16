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
      const message = messageInput.value;
      messageInput.value = '';
      SendMessage(message, emptyChatDiv, messageDiv);
    }
  })

  // Listen for chat to be cleared
  const clearBtn = document.getElementById('reset-chat-button');
  clearBtn.addEventListener('click', function () {
    window.confirm('Are you sure you would like to start a new chat?');

    localStorage.removeItem('chat_messages');

    window.location.reload();
  })
})

function SendMessage(message, emptyChatDiv, messageDiv) {
  emptyChatDiv.classList.add('hidden');
  messageDiv.classList.remove('hidden');

  const now = Date.now();

  const newMessage = {
    sender: "user",
    message: message,
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

  messageDiv.scrollTop = messageDiv.scrollHeight;
}

function renderMessage(msg, messageDiv) {
  const time = new Date(msg.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const alignment = msg.sender === "user" ? "chat-end" : "chat-start";
  const bubbleStyle = msg.sender === "user"
    ? "chat-bubble-primary"
    : "";

  const senderLabel = msg.sender === "user" ? "You" : "Assistant";

  messageDiv.insertAdjacentHTML('beforeend', `
    <div class="chat ${alignment}">
      <div class="chat-header">
        ${senderLabel} - ${time}
      </div>
      <div class="chat-bubble ${bubbleStyle}">
        ${msg.message}
      </div>
    </div>
  `);
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
