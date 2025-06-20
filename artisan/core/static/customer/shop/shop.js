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

  // Do a fetch to get all the products for the merchant to make pretty product listings
  // Select all inventory items to populate the home screen
  const shopGrid = document.querySelector('.shop-grid');
  const slug = document.body.dataset.slug;
  console.log(slug);

  fetch(`http://127.0.0.1:8000/api/${slug}/products/`, {
    method: 'GET',
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch all products!");
    return response.json();
  })
  .then(result => {
    // If results found, clear the "no items found" message
    if (result.length > 0) {
      shopGrid.innerHTML = '';
    }
    result.forEach(product => {
      console.log(product);

      // Create the shop item container
      const item = document.createElement('div');
      item.className = 'shop-item';

      // Create and append image
      const img = document.createElement('img');
      img.src = '/media/' + product.image || '/static/images/fallback.webp'; // Fallback image if needed
      img.alt = product.name;
      item.appendChild(img);

      // Info container
      const info = document.createElement('div');
      info.className = 'item-info';

      const name = document.createElement('h3');
      name.textContent = product.name;

      const price = document.createElement('p');
      price.className = 'price';
      price.textContent = `$${parseFloat(product.price).toFixed(2)}`;

      const desc = document.createElement('p');
      desc.className = 'short-desc';
      desc.textContent = product.description?.substring(0, 100) + '...';

      // Append elements
      info.appendChild(name);
      info.appendChild(price);
      info.appendChild(desc);
      item.appendChild(info);
      shopGrid.appendChild(item);

      // Open the modal screen on click
      item.addEventListener('click', function () {
        openModal(product);
      })
    });
  });
});

function openModal(product) {
  const modal = document.getElementById("product-modal");
  modal.style.display = 'block';
  console.log(product);

  document.getElementById("modal-title").innerHTML = product.name + " - Available: " + product.quantity;
  document.getElementById("modal-image").src = '/media/' + product.image;
  document.getElementById("modal-description").innerHTML = product.description;
  document.getElementById("modal-price").innerHTML = "$" + product.price;

  // Make sure the quantity entered is not too great or too small
  let quantityDesired = document.getElementById("modal-quantity");
  quantityDesired.min = 1;
  quantityDesired.max = product.quantity;

  quantityDesired.addEventListener('input', () => {
    const value = parseInt(quantityDesired.value, 10);
    const max = product.quantity;

    if (isNaN(value)) {
      quantityDesired.value = 1; // fallback for non-number input
    } else if (value > max) {
      quantityDesired.value = max;
    } else if (value < 1) {
      quantityDesired.value = max > 0 ? 1 : 0;
    }
  });
  
  // Add an event listener to close the modal
  document.querySelector("#product-modal .modal-content .close").addEventListener('click', function() {
    modal.style.display = 'none';
  })

  // Add an event listener to add the item to cart
  document.getElementById("modal-add-to-cart").addEventListener('click', function () {
    addItemToCart(product, quantityDesired.value);
    modal.style.display = 'none';
  })
}

function addItemToCart(product, quantity) {
  console.log(product.id)
  fetch('http://127.0.0.1:8000/api/cart/', {
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