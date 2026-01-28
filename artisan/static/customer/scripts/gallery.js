let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

// Toggle nav on small screens
document.addEventListener("DOMContentLoaded", async function () {
  const slug = document.body.dataset.slug;
  // Get the text content for the page for this merchant
  fetch(`${API_BASE_URL}/text/${slug}/`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get text content");
    return response.json();
  })
  .then(data => {
    const text_content = data.text_content;
    document.querySelector('.section-description').innerHTML = text_content.gallery_subtext;
  })

  // Get the current artisan's gallery images
  await fetch(`${API_BASE_URL}/gallery/${slug}/`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get gallery photos");
    return response.json();
  })
  .then(data => {
    const gallery_masonry = document.querySelector('.gallery-masonry');
    const images = data.images;
    images.forEach(img => {
      const gallery_item = document.createElement('div');
      gallery_item.className = 'gallery-item';
      gallery_item.innerHTML = `
        <img src='${img.url}' alt='gallery-image'>
      `
      gallery_masonry.appendChild(gallery_item);
    });
  })
});