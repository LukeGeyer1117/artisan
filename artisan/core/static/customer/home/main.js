const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

// Toggle nav on small screens
  document.addEventListener("DOMContentLoaded", function () {
    const toggle = document.querySelector(".menu-toggle");
    const links = document.querySelector(".nav-links");

    toggle.addEventListener("click", () => {
      links.classList.toggle("open");
    });

    // Select all inventory items to populate the home screen
    const slug = document.body.dataset.slug;
    console.log(slug);

    fetch(`${API_BASE_URL}/${slug}/products/`, {
      method: 'GET',
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch all products!");
      return response.json();
    })
    .then(result => {
      result.forEach(element => {
        console.log(element);

        // Select the parent section
        const section = document.getElementById('products-available');

        // Create the product container
        const productDiv = document.createElement('div');
        productDiv.className = 'product';

        // Create and append image
        const img = document.createElement('img');
        img.src = '/media/' + element.image;
        productDiv.appendChild(img);

        // Create a product info div
        const productInfo = document.createElement('div');
        productInfo.className = 'product-info';

        // Create product name div
        const productName = document.createElement('div');
        productName.className = 'info-subdiv';

        // Create and append product type
        const type = document.createElement('p');
        type.className = 'product-type';
        type.textContent = 'Product';
        productName.append(type);

        // Create and append product name
        const h2 = document.createElement('h2');
        h2.className = 'product-name';
        h2.textContent = element.name;
        productName.appendChild(h2);

        productInfo.append(productName);

        // Create and append the price and add cart div
        const priceDiv = document.createElement('div');
        priceDiv.className = 'info-subdiv';

        // Create and append price
        const h4 = document.createElement('h4');
        h4.className = 'price';
        h4.textContent = `$${element.price}`;
        priceDiv.appendChild(h4);

        productInfo.appendChild(priceDiv);

        productDiv.append(productInfo);


        // Insert before the "See All Products" link
        const seeMoreSection = section.querySelector('.scroll-see-more');
        section.insertBefore(productDiv, seeMoreSection);

        // Create an event listener for each product to open a modal screen when clicked with details, and an add to cart button
        productDiv.addEventListener('click', function () {
          openProductModal(element);

          // Add an event listener to 'Add to Cart' button to add it to session data cart
          document.getElementById("modal-add-to-cart-btn").addEventListener('click', function () {
            if (element.quantity == '0') {
              alert("That product is out of stock. Check back soon for restocks!");
              document.getElementById('product-modal').style.display = 'none';
              return;
            }
            let quantityDesired = document.getElementById('quantity-desired').value;
            addItemToCart(element, quantityDesired);
            const modal = document.getElementById('product-modal');
            modal.style.display = 'none';
          })
        });
      });
    })

  });

// Open the modal and populate it
function openProductModal(product) {
  document.getElementById('modal-product-image').src = '/media/' + product.image;
  document.getElementById('modal-product-title').innerText = product.name;
  document.getElementById('modal-product-price').innerText = `$${product.price}`;
  document.getElementById('modal-product-description').innerText = product.description;
  document.getElementById('modal-product-quantity').innerText = `In stock: ${product.quantity}`;
  let quantityDesired = document.getElementById('quantity-desired');
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


  const modal = document.getElementById('product-modal');
  modal.style.display = 'block';
}

// Close modal on button click
document.querySelector('.close-button').addEventListener('click', () => {
  document.getElementById('product-modal').style.display = 'none';
});

// Optional: close modal if user clicks outside the modal content
window.addEventListener('click', (e) => {
  const modal = document.getElementById('product-modal');
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

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
