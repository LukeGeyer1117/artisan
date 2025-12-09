const slug = window.slug;
let showingMenu = false;

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