import { showToast } from "../../merchant/scripts/common.js";
import { GetProduct, GetProductImages } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

// Get the product information
document.addEventListener('DOMContentLoaded', async function () {
  const slug = document.body.dataset.slug;
  const item_id = document.querySelector('main').dataset.itemId;

  const backButton = document.querySelector('.back-button');
  backButton.addEventListener('click', function () {
    window.location.href = `/shop/${slug}/`;
  })

  // Get the product and its images, and build the HTML around them
  const product = await GetProduct(item_id);    // Defined in customer commmon.js
  const product_images = await GetProductImages(item_id); // Same as above
  BuildHTML(product, product_images);

  // Double check if quantity input value is ok
  const quantityInput = document.querySelector('.number-input');
  quantityInput.addEventListener('input', function () {
    let value = parseInt(quantityInput.value);
    let currentProduct = product;
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
    let currentProduct = product;
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
      addItemToCart(product, quantityDesired);
    } else {
      showToast("Cannot add 0 items to cart");
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
    showToast("Added to cart!");
    window.location.href = `/shop/${slug}/`;
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function BuildHTML(product, product_images) {
  document.querySelector('.product-title').innerHTML = product.name;
  document.querySelector('.product-category').innerHTML = "Category: " + (product.category_id || 'Product');
  if (parseInt(product.quantity) > 0) {
    document.querySelector('.product-stock').innerHTML = product.quantity + " In Stock"
    document.querySelector('.product-stock').style.color = "#57ba6d";
  } else {
    document.querySelector('.product-stock').innerHTML = "Sold Out";
    document.querySelector('.product-stock').style.color = "#ff7a7a";
  }

  document.querySelector('.product-price').innerHTML = `$${product.price}`;
  document.querySelector('.product-description-body').textContent = product.description;

  document.querySelector('.item-photos-main').src = `${product.image}`;
  const miniImg = document.createElement('img');
  miniImg.src = `${product.image}`;
  document.querySelector('.item-photos-multi').appendChild(miniImg);

  miniImg.addEventListener('click', function () {
    document.querySelector('.item-photos-main').src = `/media/${product.image}`;
  })   
  
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
}