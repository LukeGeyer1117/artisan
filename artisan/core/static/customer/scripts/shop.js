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
  const searchInput = document.querySelector('.search-input');
  const categorySelect = document.querySelector('#categories-select');
  const budgetLow = document.getElementById('budget-low');
  const budgetHigh = document.getElementById('budget-high');

  // Do a fetch to get all the products for the merchant to make pretty product listings
  // Select all inventory items to populate the home screen
  const shopGrid = document.querySelector('.shop-grid');
  const slug = document.body.dataset.slug;

  fetch(`${API_BASE_URL}/products/${slug}/`, {
    method: 'GET',
  })
  .then(response => {
    if (!response.ok) throw new Error("Failed to fetch all products!");
    return response.json();
  })
  .then(data => {
    // If results found, clear the "no items found" message
    if (data.length > 0) {
      shopGrid.innerHTML = '';
    }
    document.querySelector('.shop-filters h3').innerHTML = `Showing ${data.length} Products`
    filterProducts(data);
    // data.forEach(product => {
    //   const item = document.createElement('div');
    //   item.className = 'shop-item';
    //   item.innerHTML = `
    //     <img src='/media/${product.image}' alt='${product.name}'>
    //     <div class='item-info'>
    //       <h3 class='name'>${product.name}</h3>
    //       <p class='price'>$${parseFloat(product.price).toFixed(2)}</p>
    //     </div>
    //   `;

    //   // Open the modal screen on click
    //   item.addEventListener('click', function () {
    //     window.location.href = `/item/${slug}/${product.id}/`;
    //   })

    //   shopGrid.appendChild(item);
    // });
    searchInput.addEventListener('input', function () {
      filterProducts(data);
    });
    categorySelect.addEventListener('change', function () {
      filterProducts(data);
    });
    budgetLow.addEventListener('input', function () {
      filterProducts(data);
    });
    budgetHigh.addEventListener('input', function () {
      filterProducts(data);
    });
  });

  // Get all the product categories
  fetch(`${API_BASE_URL}/categories/${slug}/`, {
    method: 'GET'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get categories");
    return response.json();
  })
  .then(data => {
    const categories = data.categories;
    const categorySelect = document.querySelector('#categories-select');
    categories.forEach(category => {
      const categoryOption = document.createElement('option');
      categoryOption.value = category.id;
      categoryOption.innerHTML = category.name;
      categorySelect.appendChild(categoryOption);
    })
  })
});

function openModal(product) {
  const modal = document.getElementById("product-modal");
  modal.style.display = 'block';

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

function renderResults(filtered_products) {
  const shopGrid = document.querySelector('.shop-grid');
  if (filtered_products.length === 0) {
    shopGrid.innerHTML = 'No Results Found';
  } else {
    console.log(filtered_products)
    shopGrid.innerHTML = filtered_products.map(product => (
      `
      <div class='shop-item'>
        <p id='product-id' style='display: none;'>${product.id}</p>
        <img src='/media/${product.image}' alt='${product.name}'>
        <div class='item-info'>
          <h3 class='name'>${product.name}</h3>
          <p class='price'>$${parseFloat(product.price).toFixed(2)}</p>
        </div>
      </div>
      `
    )).join('');
    document.querySelector('.shop-filters h3').innerHTML = `Showing ${filtered_products.length} Products`
    const shop_items = document.querySelectorAll('.shop-item');
    shop_items.forEach(item => {
      item.addEventListener('click', function () {
        window.location.href = `/item/${slug}/${item.querySelector('#product-id').innerHTML}/`
      })
    })
  }
}

function filterProducts(products) {
  const searchTerm = document.querySelector('.search-input').value.toLowerCase();
  const selectedCategory = document.querySelector('#categories-select').value;
  const minBudgetInput = document.getElementById('budget-low').value;
  const maxBudgetInput = document.getElementById('budget-high').value;

  // Convert inputs to numbers only if they are not blank
  const minBudget = minBudgetInput !== '' ? parseFloat(minBudgetInput) : null;
  const maxBudget = maxBudgetInput !== '' ? parseFloat(maxBudgetInput) : null;

  const filtered = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.category_id == selectedCategory;

    const matchesMin = minBudget === null || product.price >= minBudget;
    const matchesMax = maxBudget === null || product.price <= maxBudget;

    return matchesSearch && matchesCategory && matchesMin && matchesMax;
  });

  renderResults(filtered);
}
