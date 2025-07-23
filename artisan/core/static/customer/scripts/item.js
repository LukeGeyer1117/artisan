const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

// Get the product information
document.addEventListener('DOMContentLoaded', async function () {
  const slug = document.body.dataset.slug;
  const item_id = document.querySelector('main').dataset.itemId;

  const backButton = document.querySelector('.back-button');
  backButton.addEventListener('click', function () {
    window.location.href = `/shop/${slug}/`;
  })

  await fetch(`${API_BASE_URL}/product/${String(item_id)}`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not fetch product info");
    return response.json();
  })
  .then(data => {
    const product = data.product;
    document.querySelector('.product-title').innerHTML = product.name;
    document.querySelector('.product-category').innerHTML = product.category || 'Product';
    document.querySelector('.product-price').innerHTML = `$${product.price}`;
    document.querySelector('.product-description-body').innerHTML = product.description;

    document.querySelector('.item-photos-main').src = `/media/${product.image}`;
    const miniImg = document.createElement('img');
    miniImg.src = `/media/${product.image}`;
    document.querySelector('.item-photos-multi').appendChild(miniImg);
  })
})