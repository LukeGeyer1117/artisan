const slug = window.slug;
let showingMenu = false;

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

document.addEventListener('DOMContentLoaded', async function () {
  const response = await fetch(`${API_BASE_URL}/logo/${slug}`, {
    method: 'GET'
  })

  if (!response.ok) throw new Error("Couldn't get logo image");

  const data = await response.json();

  console.log(data);
  document.getElementById('nav-logo-image').src = data.image_url;

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