let form = document.querySelector(".custom-order-form");

// Example form submission logic
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // validate and send data...
  // if successful:
  window.location.href = '../custom-order-portal/success.html';
});


// Toggle nav on small screens
  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });
  });