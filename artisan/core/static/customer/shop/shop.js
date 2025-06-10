function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// Optional: close modal when clicking outside
window.addEventListener('click', function (e) {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
});



// Toggle nav on small screens
  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  });