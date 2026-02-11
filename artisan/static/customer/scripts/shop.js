import { getCategories, createProductCard } from "./common.js";

let API_BASE_URL;
if (window.location.hostname == 'localhost' || window.location.hostname == '127.0.0.1') {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;} 
else {API_BASE_URL = `${window.location.protocol}//${window.location.hostname}/api`;}

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
document.addEventListener("DOMContentLoaded", async function () {
  const searchInput = document.querySelector('.search-input');
  const categorySelect = document.querySelector('#categories-select');
  const budgetLow = document.getElementById('budget-low');
  const budgetHigh = document.getElementById('budget-high');

  // Do a fetch to get all the products for the merchant to make pretty product listings
  // Select all inventory items to populate the home screen
  const shopGrid = document.querySelector('.grid');
  const slug = document.body.dataset.slug;
  
  // Get the categories
  const categories = await getCategories(slug);

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

    filterProducts(data, categories);

    searchInput.addEventListener('input', function () {
      filterProducts(data, categories);
    });
    categorySelect.addEventListener('change', function () {
      filterProducts(data, categories);
    });
    budgetLow.addEventListener('input', function () {
      filterProducts(data, categories);
    });
    budgetHigh.addEventListener('input', function () {
      filterProducts(data, categories);
    });
  });

  // Get all the product categories
  categories.forEach(category => {
    const categoryOption = document.createElement('option');
    categoryOption.value = category.id;
    categoryOption.innerHTML = category.name;
    categorySelect.appendChild(categoryOption);
  })
});

function renderResults(filtered_products, categories) {
  const shopGrid = document.querySelector('#shop-grid');
  shopGrid.innerHTML = ``;

  if (filtered_products.length === 0) {
    shopGrid.innerHTML = 'No Results Found';
  } else {
    filtered_products.forEach(product => {
      let category_name;
      categories.forEach(cat => {
        if (cat.id == product.category_id) {category_name = cat.name}
      })
      shopGrid.appendChild(createProductCard(product, category_name));
    })

    const shop_items = document.querySelectorAll('.shop-item');
    shop_items.forEach(item => {
      item.addEventListener('click', function () {
        window.location.href = `/item/${slug}/${item.querySelector('.prod-id').innerHTML}/`
      })
    })
  }
}

function filterProducts(products, categories) {
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

  renderResults(filtered, categories);
}