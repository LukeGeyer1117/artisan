
// Get the product information
document.addEventListener('DOMContentLoaded', async function () {
  const slug = document.body.dataset.slug;
  const item_id = document.querySelector('main').dataset.itemId;

  const backButton = document.querySelector('.back-button');
  backButton.addEventListener('click', function () {
    window.location.href = `/shop/${slug}/`;
  })

  let productInfo;

  await fetch(`${API_BASE_URL}/product/${String(item_id)}`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not fetch product info");
    return response.json();
  })
  .then(data => {
    const product = data.product;
    productInfo = product;
    document.querySelector('.product-title').innerHTML = product.name;
    document.querySelector('.product-category').innerHTML = product.category || 'Product';
    document.querySelector('.product-price').innerHTML = `$${product.price}`;
    document.querySelector('.product-description-body').innerHTML = product.description;

    document.querySelector('.item-photos-main').src = `/media/${product.image}`;
    const miniImg = document.createElement('img');
    miniImg.src = `/media/${product.image}`;
    document.querySelector('.item-photos-multi').appendChild(miniImg);

    miniImg.addEventListener('click', function () {
      document.querySelector('.item-photos-main').src = `/media/${product.image}`;
    })
  })

  // Get any Product Images that are linked to the current product
  await fetch(`${API_BASE_URL}/product-image/${item_id}/`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error('Could not get product images!');
    return response.json();
  })
  .then(data => {
    const product_images = data.product_images;
    const product_image_main = document.querySelector('.item-photos-main');
    product_images.forEach(image=> {
      console.log(image);
      const miniImg = document.createElement('img');
      miniImg.src = `/media/${image.image}`;
      document.querySelector('.item-photos-multi').appendChild(miniImg);

      miniImg.addEventListener('click', function () {
        product_image_main.src = miniImg.src;
      })
    });
  })

  // Double check if quantity input value is ok
  const quantityInput = document.querySelector('.number-input');
  quantityInput.addEventListener('input', function () {
    let value = parseInt(quantityInput.value);
    let currentProduct = productInfo;
    if (value > currentProduct.quantity) {
      quantityInput.value = currentProduct.quantity
    } else if (value < 0) {
      quantityInput.value = 0;
    }
  })
    // and if using buttons
  const plusBtn = document.querySelector('.number-btn.plus');
  const minBtn = document.querySelector('.number-btn.minus');
  // Increment button
  plusBtn.addEventListener('click', function () {
    let value = parseInt(quantityInput.value) || 0;
    let currentProduct = productInfo;
    if (value < currentProduct.quantity) {
      quantityInput.value = value + 1;
      quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  // Decrement button
  minBtn.addEventListener('click', function () {
    let value = parseInt(quantityInput.value) || 0;
    if (value > 0) {
      quantityInput.value = value - 1;
      quantityInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  // Finally , listen for add to cart button to be clicked
  document.querySelector('.add-to-cart-button').addEventListener('click', function () {
    const quantityDesired = quantityInput.value;
    if (quantityDesired > 0) {
      addItemToCart(productInfo, quantityDesired);
    } else {
      alert('Cannot add 0 items to cart!');
    }
  })
})

function addItemToCart(product, quantity) {
  console.log(product.id)
  fetch(`${API_BASE_URL}/cart/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 'product_id': product.id, 'quantity': quantity })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to add item to cart');
    }
    return response.json();
  })
  .then(data => {
    console.log('Cart updated:', data);
    // Optionally update the cart UI here
    alert("Product added to cart.");
  })
  .catch(error => {
    console.error('Error:', error);
  });
}