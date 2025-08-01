import { searchAndFilter, showModal, hideModal } from "./common.js";

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api`;

document.addEventListener('DOMContentLoaded', async function () {
  const searchInput = document.querySelector('.search-container input');
  const searchIcon = document.querySelector('.search-container span img');
  let searchActive = false;
  let currentProduct = null; // Track which product is being operated on

  // Add Item Button
  let addItemButton = document.getElementById('add-item-button');
  addItemButton.addEventListener('click', function () {
    window.location.href = '/add-item/';
  });

  // Search Bar Expansion
  searchIcon.addEventListener('click', function () {
    if (!searchActive) {
      searchInput.style.width = '200px';
      searchInput.style.minWidth = '50px';
      searchInput.style.padding = '.8rem .5rem';
      searchActive = true;
    } else {
      searchInput.style.width = '0px';
      searchInput.style.minWidth = '0px';
      searchInput.style.padding = '0';
      searchActive = false;
    }
  })

  // Listen for row clicks to open product details
  const inventoryTable = document.getElementById('inventory-table');
  inventoryTable.addEventListener('click', function(e) {
    const row = e.target.closest('tr.inventory-row');
    if (row) {
      const item = JSON.parse(row.dataset.item);
      showProductDetails(item);
    }
  })

  // Modal close handlers (add once)
  const closeModalButton = document.querySelector('#product-details-modal #close-modal-btn');
  closeModalButton.addEventListener('click', function () {
    const detailsModal = document.getElementById('product-details-modal');
    hideModal(detailsModal);
    document.querySelector('.dashboard-sections').classList.remove('compressed');
    clearActiveRows();
  });

  // Edit button handler (add once)
  document.getElementById('edit-button').addEventListener('click', function () {
    if (!currentProduct) return;
    
    const detailsModal = document.getElementById('product-details-modal');
    const editModal = document.getElementById('product-edit-modal');
    
    hideModal(detailsModal);
    showModal(editModal);

    // Populate edit form with current product data
    document.getElementById('edit-title').value = currentProduct.name;
    document.getElementById('edit-price').value = currentProduct.price;
    document.getElementById('edit-stock').value = currentProduct.quantity;
    document.getElementById('edit-description').value = currentProduct.description;
  });

  // Edit form submit handler (add once)
  document.querySelector('#product-edit-modal form').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentProduct) return;

    const form = e.target;
    const formData = new FormData();

    formData.append('id', currentProduct.id);
    formData.append('name', form.querySelector('#edit-title').value);
    formData.append('price', form.querySelector('#edit-price').value);
    formData.append('description', form.querySelector('#edit-description').value);
    formData.append('quantity', form.querySelector('#edit-stock').value);
    formData.append('image', form.querySelector('#edit-image').files[0]);
    formData.append('_method', 'PATCH');

    fetch(`${API_BASE_URL}/product/`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) throw new Error("Failed to Patch Product");
      return response.json();
    })
    .then(result => {
      window.location.reload();
    })
    .catch(error => {
      console.error(error);
    });
  });

  // Delete button handler (add once)
  document.getElementById('delete-button').addEventListener('click', function () {
    if (!currentProduct) return;
    document.querySelector('#confirm-delete-modal').style.display = 'flex';
  });

  // Delete confirmation handlers (add once)
  document.getElementById('cancel-delete-button').addEventListener('click', function() {
    document.querySelector('#confirm-delete-modal').style.display = 'none';
  });

  document.getElementById('confirm-delete-button').addEventListener('click', async function() {
    if (!currentProduct) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/product/?id=${currentProduct.id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error("Failed to delete product");
      
      const result = await response.json();
      alert("Product deleted!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  });

  // Get categories, listen for new categories
  fetch(`${API_BASE_URL}/categories/`, {
    method: 'GET',
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) throw new Error("Could not get categories");
    return response.json();
  })
  .then(data => {
    console.log(data);
    const categories = data.categories;
    const category_list = document.getElementById('category-list');
    category_list.innerHTML = (categories.map(category => (
      `<li class='category-li'>${category.name}</li>`
    )).join(''))
  })
  document.getElementById('add-category-btn').addEventListener('click', function () {
    const categoryInput = document.getElementById('new-category-input');
    if (categoryInput.value) {
      // create a new catgory
      fetch(`${API_BASE_URL}/category/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'name': categoryInput.value})
      })
      .then(response => {
        if (!response.ok) throw new Error("Could not create a category");
        return response.json();
      })
      .then(data => {
        window.location.reload();
      })
    }
  })

  // Function to clear active row styling
  function clearActiveRows() {
    const rows = document.querySelectorAll('#inventory-table tr');
    rows.forEach(r => {
      r.classList.remove('active');
      r.classList.remove('gradient-background');
    });
  }

  // Function to show product details in modal
  function showProductDetails(product) {
    currentProduct = product; // Set the current product
    
    const detailsModal = document.getElementById('product-details-modal');
    showModal(detailsModal);
    // document.querySelector('.dashboard-sections').classList.add('compressed');

    // Populate modal with product data
    document.querySelector('#product-details img').src = '/media/' + product.image;
    document.getElementById('product-title').innerHTML = product.name;
    document.getElementById('product-price').innerHTML = product.price;
    if (product.quantity == '0') {
      document.getElementById('product-stock').innerHTML = "<span style='color: #FF6E6E'>Out of Stock</span>";
    } else {
      document.getElementById('product-stock').innerHTML = product.quantity;
    }
    document.getElementById('product-description').innerHTML = product.description;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/`, {
      method: 'GET',
      credentials: 'include'
    });

    if (!response.ok) throw new Error('Failed to fetch inventory products.');
    
    const products = await response.json();
    searchAndFilter(searchInput, products);

    searchInput.addEventListener('input', function () {
      searchAndFilter(searchInput, products);
    })

  } catch (error) {
    console.error('Error fetching inventory:', error);
  }
});