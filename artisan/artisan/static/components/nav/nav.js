const slug = document.body.dataset.slug;
let showingMenu = false;

document.addEventListener('DOMContentLoaded', function () {
  // Get the current shops logo image
  fetch(`${API_BASE_URL}/logo/${slug}/`, {
    'method': 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get logo image!");
    return response.json();
  })
  .then(data => {
    document.querySelector(".nav-logo-image").src = data.image_url;
  })

  // Listen for hamburger menu click
  document.querySelector('.menu-toggle').addEventListener('click', function () {
    const navLinks = document.querySelectorAll('.nav-links');
    
    if (!showingMenu) {
      navLinks.forEach((elt, index) => {
        elt.classList.add('show');
        // If you need staggered positioning, add a class with the index
        elt.classList.add(`menu-item-${index + 1}`);
      });
      showingMenu = true;
    } else {
      navLinks.forEach((elt) => {
        elt.classList.remove('show');
      });
      showingMenu = false;
    }
  });

  // Reset menu state on window resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      document.querySelectorAll('.nav-links').forEach(elt => {
        elt.classList.remove('show');
        elt.style.transform = ''; // Clear any inline styles
      });
      showingMenu = false;
    }
  });
})