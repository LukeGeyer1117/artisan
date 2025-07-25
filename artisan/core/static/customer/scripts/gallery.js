
// Toggle nav on small screens
document.addEventListener("DOMContentLoaded", async function () {
  // Get the current artisan's gallery images
  const slug = document.body.dataset.slug;

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