document.addEventListener('DOMContentLoaded', function () {
  const toggles = document.querySelectorAll('.chat-toggle');
  const panel = document.getElementById('chat-panel');
  const closeBtn = document.getElementById('chat-close');

  toggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
      panel.classList.remove('hidden');
      toggle.classList.add('hidden');
    });
  })

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });
})